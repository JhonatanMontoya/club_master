import { Router } from 'express';
import {
  getDashboard, getPromociones, getInventario,
  getReservas, getUsuarios, getReportes, getConfig, putConfig,
} from '../controllers/adminController.js';
import {
  getAdminProductos, createAdminProducto, updateAdminProducto, deleteAdminProducto,
  getAdminCategorias, createAdminCategoria, updateAdminCategoria, deleteAdminCategoria,
  patchInventario, inventarioMovimiento, getInventarioMovimientos,
  getAdminPromocionesAll, createAdminPromocion, updateAdminPromocion, deleteAdminPromocion,
  createAdminReserva, updateAdminReserva, deleteAdminReserva,
  createAdminUsuario, updateAdminUsuario,
  getAdminStaff, createAdminStaff, updateAdminStaff,
  getAdminPedidos, adminUpdatePedidoEstado,
  getAdminPagos, patchAdminPago,
  getAdminMesas, createAdminMesa, updateAdminMesa, patchAdminMesaEstado, deleteAdminMesa,
} from '../controllers/adminCrudController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/config', getConfig);
router.put('/config', putConfig);
router.get('/reportes', getReportes);

router.get('/productos', getAdminProductos);
router.post('/productos', createAdminProducto);
router.put('/productos/:id', updateAdminProducto);
router.delete('/productos/:id', deleteAdminProducto);

router.get('/categorias', getAdminCategorias);
router.post('/categorias', createAdminCategoria);
router.put('/categorias/:id', updateAdminCategoria);
router.delete('/categorias/:id', deleteAdminCategoria);

router.get('/inventario', getInventario);
router.patch('/inventario/:id', patchInventario);
router.post('/inventario/movimiento', inventarioMovimiento);
router.get('/inventario/movimientos', getInventarioMovimientos);

router.get('/promociones', getAdminPromocionesAll);
router.post('/promociones', createAdminPromocion);
router.put('/promociones/:id', updateAdminPromocion);
router.delete('/promociones/:id', deleteAdminPromocion);

router.get('/reservas', getReservas);
router.post('/reservas', createAdminReserva);
router.put('/reservas/:id', updateAdminReserva);
router.delete('/reservas/:id', deleteAdminReserva);

router.get('/usuarios', getUsuarios);
router.post('/usuarios', createAdminUsuario);
router.put('/usuarios/:id', updateAdminUsuario);

router.get('/staff', getAdminStaff);
router.post('/staff', createAdminStaff);
router.put('/staff/:id', updateAdminStaff);

router.get('/pedidos', getAdminPedidos);
router.patch('/pedidos/:id/estado', adminUpdatePedidoEstado);

router.get('/pagos', getAdminPagos);
router.patch('/pagos/:id', patchAdminPago);

router.get('/mesas', getAdminMesas);
router.post('/mesas', createAdminMesa);
router.put('/mesas/:id', updateAdminMesa);
router.patch('/mesas/:id/estado', patchAdminMesaEstado);
router.delete('/mesas/:id', deleteAdminMesa);

export default router;
