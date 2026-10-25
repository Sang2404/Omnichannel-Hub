import { Router } from 'express';
import { ProductController } from './product.controller';
import { createProductSchema, updateProductSchema, queryProductSchema } from './product.validation';
import { validateRequest } from '../../shared/middlewares/validate.middleware';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { requireRoles } from '../../shared/middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();
const controller = new ProductController();

// All routes require authentication
router.use(authMiddleware);

// Get list of products - Staff and Admin can view
router.get('/', validateRequest(queryProductSchema, 'query'), controller.list);

// Get product details - Staff and Admin can view
router.get('/:id', controller.getById);

// Create product - Shop Owner only
router.post(
  '/',
  requireRoles(Role.ADMIN),
  validateRequest(createProductSchema, 'body'),
  controller.create
);

// Update product - Shop Owner only
router.put(
  '/:id',
  requireRoles(Role.ADMIN),
  validateRequest(updateProductSchema, 'body'),
  controller.update
);

// Delete product - Shop Owner only
router.delete('/:id', requireRoles(Role.ADMIN), controller.delete);

export default router;
