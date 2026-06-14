import { supabase } from '../config/supabase.js';
import { z } from 'zod';

const palpiteSchema = z.object({
  jogo_id: z.string().uuid(),
  bolao_id: z.string().uuid(),
  gols_casa: z.number().int().min(0).max(99),
  gols_fora: z.number().int().min(0).max(99),
});

export async function listarPorBolao(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('palpites')
      .select('*, jogos(*)')
      .eq('bolao_id', req.params.bolaoId)
      .eq('usuario_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) { next(err); }
}

export async function criar(req, res, next) {
  try {
    const dados = palpiteSchema.parse(req.body);

    // Verifica se o jogo ainda não iniciou
    const { data: jogo } = await supabase
      .from('jogos').select('status, data_hora').eq('id', dados.jogo_id).single();

    if (!jogo) return res.status(404).json({ error: 'Jogo não encontrado' });

    if (jogo.status !== 'NAO_INICIADO') {
      return res.status(400).json({ error: 'Palpites encerrados para este jogo' });
    }

    if (new Date(jogo.data_hora) <= new Date()) {
      return res.status(400).json({ error: 'Palpites encerrados — jogo já começou' });
    }

    const { data, error } = await supabase
      .from('palpites')
      .insert({ ...dados, usuario_id: req.user.id })
      .select()
      .single();

    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Palpite já cadastrado. Use PUT para editar.' });
    }
    if (error) throw new Error(error.message);

    res.status(201).json(data);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
    next(err);
  }
}

export async function atualizar(req, res, next) {
  try {
    const { gols_casa, gols_fora } = z.object({
      gols_casa: z.number().int().min(0).max(99),
      gols_fora: z.number().int().min(0).max(99),
    }).parse(req.body);

    // Verifica dono e status do jogo
    const { data: palpite } = await supabase
      .from('palpites')
      .select('usuario_id, jogo_id')
      .eq('id', req.params.id)
      .single();

    if (!palpite) return res.status(404).json({ error: 'Palpite não encontrado' });
    if (palpite.usuario_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão' });

    const { data: jogo } = await supabase
      .from('jogos').select('status, data_hora').eq('id', palpite.jogo_id).single();

    if (jogo.status !== 'NAO_INICIADO' || new Date(jogo.data_hora) <= new Date()) {
      return res.status(400).json({ error: 'Não é possível editar após o início do jogo' });
    }

    const { data, error } = await supabase
      .from('palpites')
      .update({ gols_casa, gols_fora })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Dados inválidos' });
    next(err);
  }
}

export async function listarEspeciais(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('palpites_especiais')
      .select('*')
      .eq('bolao_id', req.params.bolaoId)
      .eq('usuario_id', req.user.id);

    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) { next(err); }
}

export async function criarEspecial(req, res, next) {
  try {
    const schema = z.object({
      bolao_id: z.string().uuid(),
      tipo: z.enum(['CAMPEAO', 'VICE', 'ARTILHEIRO', 'MELHOR_JOGADOR', 'SEMIFINALISTAS']),
      resposta: z.string().min(1).max(200),
    });

    const dados = schema.parse(req.body);

    const { data, error } = await supabase
      .from('palpites_especiais')
      .upsert({ ...dados, usuario_id: req.user.id }, { onConflict: 'usuario_id,bolao_id,tipo' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.status(201).json(data);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
    next(err);
  }
}

/**
 * "Consenso da galera": placar mais palpitado pelos participantes
 * de um bolão para um determinado jogo. Só revela após o jogo
 * iniciar/encerrar OU se a query param incluirAntes=true.
 */
export async function consenso(req, res, next) {
  try {
    const { bolaoId, jogoId } = req.params;

    const { data: jogo } = await supabase
      .from('jogos').select('status, data_hora').eq('id', jogoId).single();

    if (!jogo) return res.status(404).json({ error: 'Jogo não encontrado' });

    const jogoComecou = jogo.status !== 'NAO_INICIADO' || new Date(jogo.data_hora) <= new Date();

    if (!jogoComecou && req.query.incluirAntes !== 'true') {
      return res.status(403).json({ error: 'Consenso disponível apenas após o início da partida' });
    }

    const { data: palpites, error } = await supabase
      .from('palpites')
      .select('gols_casa, gols_fora')
      .eq('bolao_id', bolaoId)
      .eq('jogo_id', jogoId);

    if (error) throw new Error(error.message);

    if (!palpites.length) {
      return res.json({ total_palpites: 0, placares: [] });
    }

    const contagem = {};
    for (const p of palpites) {
      const key = `${p.gols_casa}x${p.gols_fora}`;
      contagem[key] = (contagem[key] || 0) + 1;
    }

    const placares = Object.entries(contagem)
      .map(([placar, qtd]) => {
        const [gols_casa, gols_fora] = placar.split('x').map(Number);
        return {
          gols_casa,
          gols_fora,
          quantidade: qtd,
          percentual: Math.round((qtd / palpites.length) * 100),
        };
      })
      .sort((a, b) => b.quantidade - a.quantidade);

    res.json({ total_palpites: palpites.length, placares });
  } catch (err) { next(err); }
}
