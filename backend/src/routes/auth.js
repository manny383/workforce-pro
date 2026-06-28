import express from 'express';
import { login, register, updateProfilePhoto } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔐 Login
router.post('/login', login);

// 🧾 Registro
router.post('/register', register);

router.patch('/photo', verifyToken, updateProfilePhoto);

export default router;
