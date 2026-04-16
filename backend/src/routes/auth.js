import express from 'express';
import { login, register } from '../controllers/authController.js';

const router = express.Router();

// 🔐 Login
router.post('/login', login);

// 🧾 Registro
router.post('/register', register);

export default router;