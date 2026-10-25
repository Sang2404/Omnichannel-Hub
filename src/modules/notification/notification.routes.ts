import { Router } from 'express';
import { NotificationController } from './notification.controller';

const router = Router();
const controller = new NotificationController();

router.get('/', controller.list);
router.patch('/:id/read', controller.markAsRead);
router.post('/read-all', controller.markAllAsRead);
router.post('/', controller.create);

export default router;
