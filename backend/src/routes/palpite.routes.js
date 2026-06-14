import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as PalpiteController from '../controllers/palpite.controller.js';

const router = Router();

router.use(authenticate);

router.get('/bolao/:bolaoId', PalpiteController.listarPorBolao);
router.post('/', PalpiteController.criar);
router.put('/:id', PalpiteController.atualizar);

// Palpites especiais
router.get('/especiais/bolao/:bolaoId', PalpiteController.listarEspeciais);
router.post('/especiais', PalpiteController.criarEspecial);

export default router;
