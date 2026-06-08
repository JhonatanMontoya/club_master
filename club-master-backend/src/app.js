import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import mesasRoutes from './routes/mesas.js';
import productosRoutes from './routes/productos.js';
import pedidosRoutes from './routes/pedidos.js';
import pagosRoutes from './routes/pagos.js';
import adminRoutes from './routes/admin.js';
import { mockRouter } from './routes/mock.js';

dotenv.config();

const app = express();

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://club-master-omega.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'CLUB MASTER API', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mock', mockRouter);

app.get('/', (_req, res) => {
  res.json({
    message: 'CLUB MASTER API',
    hint: 'La app web se sirve desde el frontend. Usa /api/health para comprobar el API.',
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

export default app;
