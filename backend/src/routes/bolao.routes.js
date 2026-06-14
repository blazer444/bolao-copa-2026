import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as BolaoController from '../controllers/bolao.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', BolaoController.listarMeus);
router.post('/', BolaoController.criar);
router.get('/:id', BolaoController.buscarPorId);
router.put('/:id', BolaoController.atualizar);
router.delete('/:id', BolaoController.encerrar);

// Participação
router.post('/entrar', BolaoController.entrar);
router.delete('/:id/sair', BolaoController.sair);
router.delete('/:id/participantes/:usuarioId', BolaoController.removerParticipante);

// Participantes
router.get('/:id/participantes', BolaoController.listarParticipantes);

export default router;
