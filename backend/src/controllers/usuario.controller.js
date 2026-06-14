import { supabase } from '../config/supabase.js';
import { z } from 'zod';

export async function perfil(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(data);
  } catch (err) { next(err); }
}

export async function atualizar(req, res, next) {
  try {
    const schema = z.object({
      nome: z.string().min(2).max(100).optional(),
      avatar_url: z.string().url().optional(),
    });

    const dados = schema.parse(req.body);

    const { data, error } = await supabase
      .from('usuarios')
      .update(dados)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Dados inválidos' });
    next(err);
  }
}
