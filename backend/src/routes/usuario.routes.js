import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as UsuarioController from '../controllers/usuario.controller.js';

const router = Router();

router.use(authenticate);

router.get('/me', UsuarioController.perfil);
router.put('/me', UsuarioController.atualizar);

export default router;
