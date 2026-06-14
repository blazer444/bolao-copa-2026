import { supabase } from '../config/supabase.js';
import { randomBytes } from 'crypto';

function gerarCodigo() {
  return randomBytes(4).toString('hex').toUpperCase(); // ex: A3F9B2C1
}

export async function criar(dados) {
  const codigo_convite = gerarCodigo();

  const { data, error } = await supabase
    .from('boloes')
    .insert({ ...dados, codigo_convite })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Criador vira participante automaticamente
  await supabase.from('participantes').insert({
    usuario_id: dados.criador_id,
    bolao_id: data.id,
  });

  return data;
}

export async function listarPorUsuario(usuarioId) {
  const { data, error } = await supabase
    .from('participantes')
    .select(`
      bolao_id,
      boloes (
        id, nome, descricao, codigo_convite, publico, ativo, created_at,
        criador_id,
        usuarios!boloes_criador_id_fkey (nome, avatar_url)
      )
    `)
    .eq('usuario_id', usuarioId);

  if (error) throw new Error(error.message);
  return data.map(p => p.boloes);
}

export async function buscarPorId(id, usuarioId) {
  const { data, error } = await supabase
    .from('boloes')
    .select(`
      *,
      usuarios!boloes_criador_id_fkey (id, nome, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;

  // Verifica se o usuário participa
  const { data: part } = await supabase
    .from('participantes')
    .select('id')
    .eq('bolao_id', id)
    .eq('usuario_id', usuarioId)
    .single();

  if (!part && !data.publico) return null;

  return data;
}

export async function atualizar(id, usuarioId, dados) {
  // Só o criador pode alterar
  const { data: bolao } = await supabase.from('boloes').select('criador_id').eq('id', id).single();
  if (!bolao || bolao.criador_id !== usuarioId) {
    const err = new Error('Sem permissão'); err.status = 403; throw err;
  }

  const camposPermitidos = ['nome', 'descricao', 'publico', 'pts_acertou_vencedor',
    'pts_acertou_empate', 'pts_acertou_saldo', 'pts_acertou_placar_exato'];
  const update = {};
  camposPermitidos.forEach(c => { if (dados[c] !== undefined) update[c] = dados[c]; });

  const { data, error } = await supabase.from('boloes').update(update).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function encerrar(id, usuarioId) {
  const { data: bolao } = await supabase.from('boloes').select('criador_id').eq('id', id).single();
  if (!bolao || bolao.criador_id !== usuarioId) {
    const err = new Error('Sem permissão'); err.status = 403; throw err;
  }
  await supabase.from('boloes').update({ ativo: false }).eq('id', id);
}

export async function entrarPorCodigo(codigo, usuarioId) {
  const { data: bolao, error } = await supabase
    .from('boloes')
    .select('*')
    .eq('codigo_convite', codigo.toUpperCase())
    .eq('ativo', true)
    .single();

  if (error || !bolao) {
    const err = new Error('Bolão não encontrado ou inativo'); err.status = 404; throw err;
  }

  const { error: insertError } = await supabase
    .from('participantes')
    .insert({ usuario_id: usuarioId, bolao_id: bolao.id });

  if (insertError?.code === '23505') {
    const err = new Error('Você já participa deste bolão'); err.status = 409; throw err;
  }

  if (insertError) throw new Error(insertError.message);

  return bolao;
}

export async function removerParticipante(bolaoId, usuarioId, solicitanteId) {
  const { data: bolao } = await supabase.from('boloes').select('criador_id').eq('id', bolaoId).single();

  // Só o criador pode remover outros; qualquer um pode sair
  if (usuarioId !== solicitanteId && bolao?.criador_id !== solicitanteId) {
    const err = new Error('Sem permissão'); err.status = 403; throw err;
  }

  await supabase.from('participantes')
    .delete()
    .eq('bolao_id', bolaoId)
    .eq('usuario_id', usuarioId);
}

export async function listarParticipantes(bolaoId) {
  const { data, error } = await supabase
    .from('participantes')
    .select(`
      joined_at,
      usuarios (id, nome, avatar_url),
      pontuacoes!left (pontos_total, total_palpites)
    `)
    .eq('bolao_id', bolaoId);

  if (error) throw new Error(error.message);
  return data;
};
