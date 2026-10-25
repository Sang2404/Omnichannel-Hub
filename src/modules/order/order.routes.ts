import { Router } from 'express';
import { OrderController } from './order.controller';
import { createOrderSchema, queryOrderSchema, updateOrderStatusSchema } from './order.validation';
import { validateRequest } from '../../shared/middlewares/validate.middleware';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();
const controller = new OrderController();

// Auth required for all order endpoints
router.use(authMiddleware);

router.get('/', validateRequest(queryOrderSchema, 'query'), controller.list);
router.get('/:id', controller.getById);
router.post('/', validateRequest(createOrderSchema, 'body'), controller.create);
router.patch('/:id/status', validateRequest(updateOrderStatusSchema, 'body'), controller.updateStatus);

export default router;
