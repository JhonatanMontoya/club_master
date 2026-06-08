import { Router } from 'express';
import {
  createPedido, getPedidos, getPedidoById,
  updatePedidoEstado, getEstadosPedido, getPedidosStaff,
  getPedidosPendientesAprobacion, aprobarPedido, rechazarPedido,
  addPedidoItem, updatePedidoItem, removePedidoItem,
} from '../controllers/pedidosController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/estados', getEstadosPedido);
router.get('/staff', authenticate, authorize('staff', 'admin'), getPedidosStaff);
router.get('/pendientes-aprobacion', authenticate, authorize('staff', 'admin'), getPedidosPendientesAprobacion);
router.get('/', authenticate, getPedidos);
router.get('/:id', optionalAuth, getPedidoById);
router.post('/', optionalAuth, createPedido);
router.patch('/:id/estado', authenticate, authorize('staff', 'admin'), updatePedidoEstado);
router.patch('/:id/aprobar', authenticate, authorize('staff', 'admin'), aprobarPedido);
router.patch('/:id/rechazar', authenticate, authorize('staff', 'admin'), rechazarPedido);
router.post('/:id/items', authenticate, authorize('staff', 'admin'), addPedidoItem);
router.patch('/:id/items/:productoId', authenticate, authorize('staff', 'admin'), updatePedidoItem);
router.delete('/:id/items/:productoId', authenticate, authorize('staff', 'admin'), removePedidoItem);

export default router;
