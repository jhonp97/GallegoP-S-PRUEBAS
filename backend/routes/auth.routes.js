
import express from 'express';
import { login, seedAdmin, logout, resetPassword } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { checkSession } from '../controllers/auth.controller.js';

import { getMe } from '../controllers/auth.controller.js';
const router = express.Router();

router.post('/login', login);
router.get("/me", authMiddleware, getMe);
router.get('/check', authMiddleware, checkSession);

router.post('/seed-admin', seedAdmin);
router.post('/logout', logout);

// reset password: protegido (solo admin) -> pero como solo hay un usuario (admin) se puede proteger y permitir cambiar
router.patch('/reset-password', authMiddleware, resetPassword);

export default router;
