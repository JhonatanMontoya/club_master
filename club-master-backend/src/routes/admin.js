import { Router } from 'express';
import {
  getDashboard, getPromociones, getInventario,
  getReservas, getUsuarios, getReportes, getConfig,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/promociones', getPromociones);
router.get('/inventario', getInventario);
router.get('/reservas', getReservas);
router.get('/usuarios', getUsuarios);
router.get('/reportes', getReportes);
router.get('/config', getConfig);

export default router;
