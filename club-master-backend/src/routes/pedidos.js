import { Router } from 'express';
import {
  createPedido, getPedidos, getPedidoById,
  updatePedidoEstado, getEstadosPedido, getPedidosStaff,
} from '../controllers/pedidosController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/estados', getEstadosPedido);
router.get('/staff', authenticate, authorize('staff', 'admin'), getPedidosStaff);
router.get('/', authenticate, getPedidos);
router.get('/:id', authenticate, getPedidoById);
router.post('/', optionalAuth, createPedido);
router.patch('/:id/estado', authenticate, authorize('staff', 'admin'), updatePedidoEstado);

export default router;
