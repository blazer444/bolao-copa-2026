import { Router } from 'express';
import authRoutes from './auth.routes.js';
import bolaoRoutes from './bolao.routes.js';
import jogoRoutes from './jogo.routes.js';
import palpiteRoutes from './palpite.routes.js';
import rankingRoutes from './ranking.routes.js';
import usuarioRoutes from './usuario.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/boloes', bolaoRoutes);
router.use('/jogos', jogoRoutes);
router.use('/palpites', palpiteRoutes);
router.use('/ranking', rankingRoutes);
router.use('/usuarios', usuarioRoutes);

export default router;
