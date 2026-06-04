import { Router } from 'express';
import { getMetodosPago, createPago, getPagos } from '../controllers/pagosController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/metodos', getMetodosPago);
router.get('/', authenticate, authorize('admin'), getPagos);
router.post('/', authenticate, createPago);

export default router;
