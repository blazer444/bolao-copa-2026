/**
 * Serviço de integração com Football-Data.org
 * Docs: https://www.football-data.org/documentation/quickstart
 *
 * Plano gratuito: 10 requisições/minuto.
 * Competição da Copa do Mundo: código "WC".
 */
import axios from 'axios';
import { supabase } from '../config/supabase.js';

const api = axios.create({
  baseURL: 'https://api.football-data.org/v4',
  headers: {
    'X-Auth-Token': process.env.FOOTBALL_API_KEY,
  },
  timeout: 25_000,
});

const COMPETITION_CODE = process.env.WORLD_CUP_COMPETITION_CODE || 'WC';

/**
 * Faz uma chamada GET com 1 retry em caso de erro de rede
 * (socket hang up, timeout, ECONNRESET, etc).
 */
async function getComRetry(url, config) {
  try {
    return await api.get(url, config);
  } catch (err) {
    const errosTransitorios = ['ECONNRESET', 'ETIMEDOUT', 'ECONNABORTED'];
    const isTransitorio = errosTransitorios.includes(err.code) || err.message?.includes('socket hang up');

    if (!isTransitorio) throw err;

    console.warn(`[football-api] erro transitório (${err.code || err.message}), tentando novamente em 3s...`);
    await new Promise(r => setTimeout(r, 3000));
    return await api.get(url, config);
  }
}

/**
 * Mapeia status da Football-Data.org para o padrão interno
 */
function mapStatus(apiStatus) {
  const ao_vivo = ['IN_PLAY', 'PAUSED'];
  const encerrado = ['FINISHED', 'AWARDED'];
  if (ao_vivo.includes(apiStatus)) return 'AO_VIVO';
  if (encerrado.includes(apiStatus)) return 'ENCERRADO';
  return 'NAO_INICIADO'; // SCHEDULED, TIMED, POSTPONED, etc.
}

/**
 * Busca todos os jogos da Copa do Mundo e sincroniza com Supabase
 */
export async function sincronizarJogos() {
  const { data } = await getComRetry(`/competitions/${COMPETITION_CODE}/matches`);

  const matches = data.matches;

  const jogosParaUpsert = matches.map(m => ({
    api_id: String(m.id),
    selecao_casa: m.homeTeam?.name || 'A definir',
    selecao_fora: m.awayTeam?.name || 'A definir',
    bandeira_casa: m.homeTeam?.crest || null,
    bandeira_fora: m.awayTeam?.crest || null,
    data_hora: new Date(m.utcDate).toISOString(),
    estadio: m.venue || null,
    cidade: null,
    fase: m.stage || null,
    grupo: m.group || null,
    status: mapStatus(m.status),
  }));

  const { error } = await supabase
    .from('jogos')
    .upsert(jogosParaUpsert, { onConflict: 'api_id' });

  if (error) throw new Error(`Erro ao sincronizar jogos: ${error.message}`);

  console.log(`✅ ${jogosParaUpsert.length} jogos sincronizados`);
  return jogosParaUpsert.length;
}

/**
 * Busca jogos FINALIZADOS e salva resultados, depois calcula pontuação
 */
export async function sincronizarResultados() {
  const { data } = await getComRetry(`/competitions/${COMPETITION_CODE}/matches`, {
    params: { status: 'FINISHED' },
  });

  for (const m of data.matches) {
    const { data: jogo } = await supabase
      .from('jogos')
      .select('id')
      .eq('api_id', String(m.id))
      .single();

    if (!jogo) continue;

    const gols_casa = m.score?.fullTime?.home ?? 0;
    const gols_fora = m.score?.fullTime?.away ?? 0;

    // Upsert resultado
    await supabase.from('resultados').upsert({
      jogo_id: jogo.id,
      gols_casa,
      gols_fora,
    }, { onConflict: 'jogo_id' });

    // Atualiza status do jogo
    await supabase.from('jogos').update({ status: 'ENCERRADO' }).eq('id', jogo.id);

    // Busca bolões com palpites não calculados para esse jogo
    const { data: palpitesPendentes } = await supabase
      .from('palpites')
      .select('bolao_id')
      .eq('jogo_id', jogo.id)
      .eq('calculado', false);

    const boloesUnicos = [...new Set(palpitesPendentes?.map(p => p.bolao_id) || [])];

    for (const bolaoId of boloesUnicos) {
      await supabase.rpc('atualizar_pontuacao_bolao', {
        p_jogo_id: jogo.id,
        p_bolao_id: bolaoId,
      });
    }
  }

  console.log(`✅ Resultados sincronizados`);
}