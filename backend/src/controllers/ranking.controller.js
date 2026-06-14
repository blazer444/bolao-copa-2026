import { supabase } from '../config/supabase.js';

export async function porBolao(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('pontuacoes')
      .select(`
        pontos_total, total_palpites, acertos_placar_exato,
        usuarios (id, nome, avatar_url)
      `)
      .eq('bolao_id', req.params.bolaoId)
      .order('pontos_total', { ascending: false });

    if (error) throw new Error(error.message);

    const ranking = data.map((item, index) => ({
      posicao: index + 1,
      usuario: item.usuarios,
      pontos_total: item.pontos_total,
      total_palpites: item.total_palpites,
      acertos_placar_exato: item.acertos_placar_exato,
      destaque: index < 3,
      sou_eu: item.usuarios?.id === req.user.id,
    }));

    res.json(ranking);
  } catch (err) { next(err); }
}

export async function publico(req, res, next) {
  try {
    // Verifica se o bolão é público
    const { data: bolao } = await supabase
      .from('boloes')
      .select('id, nome, publico')
      .eq('id', req.params.bolaoId)
      .single();

    if (!bolao?.publico) return res.status(403).json({ error: 'Ranking não público' });

    const { data, error } = await supabase
      .from('pontuacoes')
      .select(`pontos_total, usuarios (nome, avatar_url)`)
      .eq('bolao_id', req.params.bolaoId)
      .order('pontos_total', { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);

    res.json({
      bolao: bolao.nome,
      ranking: data.map((item, i) => ({
        posicao: i + 1,
        nome: item.usuarios.nome,
        avatar: item.usuarios.avatar_url,
        pontos: item.pontos_total,
      })),
    });
  } catch (err) { next(err); }
}

export async function estatisticasUsuario(req, res, next) {
  try {
    const { bolaoId, usuarioId } = req.params;

    const { data: pontuacao } = await supabase
      .from('pontuacoes')
      .select('*')
      .eq('bolao_id', bolaoId)
      .eq('usuario_id', usuarioId)
      .single();

    const { data: palpites } = await supabase
      .from('palpites')
      .select('pontos_obtidos, calculado, created_at, jogos(data_hora, fase)')
      .eq('bolao_id', bolaoId)
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });

    const acertos = palpites?.filter(p => p.pontos_obtidos > 0).length || 0;
    const calculados = palpites?.filter(p => p.calculado).length || 0;
    const percentual = calculados > 0 ? Math.round((acertos / calculados) * 100) : 0;

    res.json({
      ...pontuacao,
      percentual_acerto: percentual,
      palpites,
    });
  } catch (err) { next(err); }
}

/**
 * Confronto direto: compara os palpites de dois usuários jogo a jogo,
 * dentro de um bolão, mostrando quem acertou mais.
 */
export async function confrontoDireto(req, res, next) {
  try {
    const { bolaoId, usuarioA, usuarioB } = req.params;

    const [{ data: palpitesA }, { data: palpitesB }, { data: usuariosInfo }] = await Promise.all([
      supabase
        .from('palpites')
        .select('jogo_id, gols_casa, gols_fora, pontos_obtidos, calculado, jogos(selecao_casa, selecao_fora, data_hora, status, resultados(gols_casa, gols_fora))')
        .eq('bolao_id', bolaoId)
        .eq('usuario_id', usuarioA),
      supabase
        .from('palpites')
        .select('jogo_id, gols_casa, gols_fora, pontos_obtidos, calculado')
        .eq('bolao_id', bolaoId)
        .eq('usuario_id', usuarioB),
      supabase
        .from('usuarios')
        .select('id, nome, avatar_url')
        .in('id', [usuarioA, usuarioB]),
    ]);

    const mapB = Object.fromEntries((palpitesB || []).map(p => [p.jogo_id, p]));

    let vitoriasA = 0, vitoriasB = 0, empates = 0;

    const confrontos = (palpitesA || [])
      .filter(pa => mapB[pa.jogo_id])
      .map(pa => {
        const pb = mapB[pa.jogo_id];
        if (pa.calculado) {
          if (pa.pontos_obtidos > pb.pontos_obtidos) vitoriasA++;
          else if (pb.pontos_obtidos > pa.pontos_obtidos) vitoriasB++;
          else empates++;
        }
        return {
          jogo: pa.jogos,
          palpite_a: { gols_casa: pa.gols_casa, gols_fora: pa.gols_fora, pontos: pa.pontos_obtidos },
          palpite_b: { gols_casa: pb.gols_casa, gols_fora: pb.gols_fora, pontos: pb.pontos_obtidos },
          calculado: pa.calculado,
        };
      })
      .sort((a, b) => new Date(a.jogo?.data_hora) - new Date(b.jogo?.data_hora));

    const usuarioInfoA = usuariosInfo?.find(u => u.id === usuarioA);
    const usuarioInfoB = usuariosInfo?.find(u => u.id === usuarioB);

    res.json({
      usuario_a: usuarioInfoA,
      usuario_b: usuarioInfoB,
      vitorias_a: vitoriasA,
      vitorias_b: vitoriasB,
      empates,
      confrontos,
    });
  } catch (err) { next(err); }
}

/**
 * Evolução do ranking: pontuação acumulada de cada participante
 * jogo a jogo, ordenado por data, para gráfico de linha.
 */
export async function evolucao(req, res, next) {
  try {
    const { bolaoId } = req.params;

    const { data: palpites, error } = await supabase
      .from('palpites')
      .select('usuario_id, pontos_obtidos, calculado, usuarios(nome), jogos(data_hora, selecao_casa, selecao_fora)')
      .eq('bolao_id', bolaoId)
      .eq('calculado', true)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    // Ordena por data do jogo
    const ordenados = [...(palpites || [])].sort(
      (a, b) => new Date(a.jogos?.data_hora) - new Date(b.jogos?.data_hora)
    );

    // Agrupa por jogo (rodada) e acumula pontos por usuário
    const jogosUnicos = [...new Set(ordenados.map(p => `${p.jogos?.data_hora}|${p.jogos?.selecao_casa}|${p.jogos?.selecao_fora}`))];
    const acumulado = {};
    const series = [];

    for (const jogoKey of jogosUnicos) {
      const palpitesDoJogo = ordenados.filter(
        p => `${p.jogos?.data_hora}|${p.jogos?.selecao_casa}|${p.jogos?.selecao_fora}` === jogoKey
      );

      const [, casa, fora] = jogoKey.split('|');
      const ponto = { rodada: `${casa} x ${fora}` };

      for (const p of palpitesDoJogo) {
        const nome = p.usuarios?.nome || 'Jogador';
        acumulado[nome] = (acumulado[nome] || 0) + (p.pontos_obtidos || 0);
      }

      // snapshot do acumulado de todos até este ponto
      for (const nome of Object.keys(acumulado)) {
        ponto[nome] = acumulado[nome];
      }

      series.push(ponto);
    }

    res.json({ jogadores: Object.keys(acumulado), series });
  } catch (err) { next(err); }
}
