import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { createCustomerSchema, updateCustomerSchema, queryCustomerSchema } from './customer.validation';
import { validateRequest } from '../../shared/middlewares/validate.middleware';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();
const controller = new CustomerController();

// Auth required for all customer routes
router.use(authMiddleware);

router.get('/', validateRequest(queryCustomerSchema, 'query'), controller.list);
router.get('/:id', controller.getById);
router.post('/', validateRequest(createCustomerSchema, 'body'), controller.create);
router.put('/:id', validateRequest(updateCustomerSchema, 'body'), controller.update);
router.delete('/:id', controller.delete);

export default router;
