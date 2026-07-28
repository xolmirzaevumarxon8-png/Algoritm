import { Router } from 'express';
import { getDirectors, createDirector, updateDirector, deleteDirector } from '../controllers/directors.controller';
import { authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authorizeRoles('SUPER_ADMIN'), getDirectors);
router.post('/', authorizeRoles('SUPER_ADMIN'), createDirector);
router.put('/:id', authorizeRoles('SUPER_ADMIN'), updateDirector);
router.delete('/:id', authorizeRoles('SUPER_ADMIN'), deleteDirector);

export default router;
