import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import attendanceRoutes from './routes/attendance.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

const corsOptions = process.env.FRONTEND_ORIGIN
  ? { origin: process.env.FRONTEND_ORIGIN }
  : {};

// Middlewares globales
app.use(cors(corsOptions));
app.use(express.json());

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API funcionando');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Middleware de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Error interno del servidor',
  });
});

export default app;
