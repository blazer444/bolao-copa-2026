import { supabase } from '../config/supabase.js';
import { sincronizarJogos } from '../services/football-api.service.js';

export async function listar(req, res, next) {
  try {
    const { fase, status } = req.query;
    let query = supabase
      .from('jogos')
      .select('*, resultados(*)')
      .order('data_hora', { ascending: true });

    if (fase) query = query.eq('fase', fase);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) { next(err); }
}

export async function proximos(req, res, next) {
  try {
    const agora = new Date().toISOString();
    const { data, error } = await supabase
      .from('jogos')
      .select('*')
      .eq('status', 'NAO_INICIADO')
      .gte('data_hora', agora)
      .order('data_hora', { ascending: true })
      .limit(10);

    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) { next(err); }
}

export async function buscarPorId(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('jogos')
      .select('*, resultados(*)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Jogo não encontrado' });
    res.json(data);
  } catch (err) { next(err); }
}

export async function sincronizar(req, res, next) {
  try {
    const count = await sincronizarJogos();
    res.json({ message: `${count} jogos sincronizados` });
  } catch (err) { next(err); }
}
