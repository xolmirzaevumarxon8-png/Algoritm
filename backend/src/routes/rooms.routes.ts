import { Router } from 'express';
import { 
  getRooms, 
  getRoomById,
  getRoomSchedule,
  createRoom, 
  updateRoom, 
  deleteRoom 
} from '../controllers/rooms.controller';

const router = Router();

router.get('/', getRooms);
router.get('/:id', getRoomById);
router.get('/:id/schedule', getRoomSchedule);
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

export default router;
