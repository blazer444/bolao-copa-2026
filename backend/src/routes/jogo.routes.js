import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as JogoController from '../controllers/jogo.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', JogoController.listar);
router.get('/proximos', JogoController.proximos);
router.get('/:id', JogoController.buscarPorId);

// Sincronização com API de futebol (uso interno / cron)
router.post('/sincronizar', JogoController.sincronizar);
router.post('/sincronizar-resultados', JogoController.sincronizarResultadosHandler);

export default router;
