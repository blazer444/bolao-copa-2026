import { Router } from 'express';
import { strictLimiter } from '../middlewares/rateLimiter.js';
import * as AuthController from '../controllers/auth.controller.js';

const router = Router();

router.post('/cadastro', strictLimiter, AuthController.cadastro);
router.post('/login', strictLimiter, AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/recuperar-senha', strictLimiter, AuthController.recuperarSenha);

export default router;
