import { Router } from 'express';
import {
  getCategorias, getProductos, getProductoById,
  createProducto, updateProducto, deleteProducto,
  createCategoria, updateCategoria,
} from '../controllers/productosController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/categorias', getCategorias);
router.post('/categorias', authenticate, authorize('admin'), createCategoria);
router.put('/categorias/:id', authenticate, authorize('admin'), updateCategoria);

router.get('/', getProductos);
router.get('/:id', getProductoById);
router.post('/', authenticate, authorize('admin'), createProducto);
router.put('/:id', authenticate, authorize('admin'), updateProducto);
router.delete('/:id', authenticate, authorize('admin'), deleteProducto);

export default router;
