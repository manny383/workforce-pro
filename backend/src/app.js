import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Rutas
import authRoutes from './routes/auth.js';
import attendanceRoutes from './routes/attendance.js';

dotenv.config();

const app = express();

//
// 🔹 Middlewares globales
//
app.use(cors());
app.use(express.json());

//
// 🔹 Rutas principales
//
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);

//
// 🔹 Ruta base (test)
//
app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

//
// 🔹 Middleware de errores (MUY IMPORTANTE)
//
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Error interno del servidor',
  });
});

export default app;
