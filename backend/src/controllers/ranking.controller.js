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
