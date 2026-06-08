import { Router } from 'express';
import { getMesas, getMesaByCodigo, updateMesaEstado, updateMesa, createMesa, deleteMesa } from '../controllers/mesasController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getMesas);
router.get('/codigo/:codigo', getMesaByCodigo);
router.patch('/:id/estado', authenticate, authorize('admin', 'staff'), updateMesaEstado);
router.put('/:id', authenticate, authorize('admin'), updateMesa);
router.post('/', authenticate, authorize('admin'), createMesa);
router.delete('/:id', authenticate, authorize('admin'), deleteMesa);

export default router;
