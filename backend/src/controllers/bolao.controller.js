import * as BolaoService from '../services/bolao.service.js';
import { z } from 'zod';

const criarSchema = z.object({
  nome: z.string().min(2).max(100),
  descricao: z.string().max(500).optional(),
  publico: z.boolean().default(false),
  pts_acertou_vencedor: z.number().int().min(1).max(100).default(3),
  pts_acertou_empate: z.number().int().min(1).max(100).default(3),
  pts_acertou_saldo: z.number().int().min(1).max(100).default(5),
  pts_acertou_placar_exato: z.number().int().min(1).max(100).default(10),
});

export async function listarMeus(req, res, next) {
  try {
    const boloes = await BolaoService.listarPorUsuario(req.user.id);
    res.json(boloes);
  } catch (err) { next(err); }
}

export async function criar(req, res, next) {
  try {
    const dados = criarSchema.parse(req.body);
    const bolao = await BolaoService.criar({ ...dados, criador_id: req.user.id });
    res.status(201).json(bolao);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
    next(err);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const bolao = await BolaoService.buscarPorId(req.params.id, req.user.id);
    if (!bolao) return res.status(404).json({ error: 'Bolão não encontrado' });
    res.json(bolao);
  } catch (err) { next(err); }
}

export async function atualizar(req, res, next) {
  try {
    const bolao = await BolaoService.atualizar(req.params.id, req.user.id, req.body);
    res.json(bolao);
  } catch (err) { next(err); }
}

export async function encerrar(req, res, next) {
  try {
    await BolaoService.encerrar(req.params.id, req.user.id);
    res.json({ message: 'Bolão encerrado' });
  } catch (err) { next(err); }
}

export async function entrar(req, res, next) {
  try {
    const { codigo } = z.object({ codigo: z.string().min(4) }).parse(req.body);
    const bolao = await BolaoService.entrarPorCodigo(codigo, req.user.id);
    res.json(bolao);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Código inválido' });
    next(err);
  }
}

export async function sair(req, res, next) {
  try {
    await BolaoService.removerParticipante(req.params.id, req.user.id, req.user.id);
    res.json({ message: 'Saiu do bolão' });
  } catch (err) { next(err); }
}

export async function removerParticipante(req, res, next) {
  try {
    await BolaoService.removerParticipante(req.params.id, req.params.usuarioId, req.user.id);
    res.json({ message: 'Participante removido' });
  } catch (err) { next(err); }
}

export async function listarParticipantes(req, res, next) {
  try {
    const participantes = await BolaoService.listarParticipantes(req.params.id);
    res.json(participantes);
  } catch (err) { next(err); }
}
