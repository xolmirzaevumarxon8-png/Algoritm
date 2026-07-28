import { Router } from 'express';
import { getCashiers, createCashier, deleteCashier } from '../controllers/cashiers.controller';

const router = Router();

router.get('/', getCashiers);
router.post('/', createCashier);
router.delete('/:id', deleteCashier);

export default router;
