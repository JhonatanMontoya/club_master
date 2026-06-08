import { Router } from 'express';
import { getPromocionesPublicas } from '../controllers/promocionesController.js';

const router = Router();

router.get('/', getPromocionesPublicas);

export default router;
