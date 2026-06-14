import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as RankingController from '../controllers/ranking.controller.js';

const router = Router();

// Rota pública do ranking
router.get('/publico/:bolaoId', RankingController.publico);

router.use(authenticate);

router.get('/bolao/:bolaoId', RankingController.porBolao);
router.get('/bolao/:bolaoId/usuario/:usuarioId', RankingController.estatisticasUsuario);

export default router;
