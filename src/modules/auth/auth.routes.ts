import { Router } from 'express';
import { AuthController } from './auth.controller';
import { registerSchema, loginSchema } from './auth.validation';
import { validateRequest } from '../../shared/middlewares/validate.middleware';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { requireRoles } from '../../shared/middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();
const controller = new AuthController();

// Public login route
router.post('/login', validateRequest(loginSchema), controller.login);

// User registration route (Super Admin & Shop Owner)
router.post(
  '/register',
  authMiddleware,
  requireRoles(Role.SUPER_ADMIN, Role.ADMIN),
  validateRequest(registerSchema),
  controller.register
);

// Authenticated user profile retrieval
router.get('/profile', authMiddleware, controller.getProfile);

// User and Platform administration (Super Admin & Shop Owner)
router.get('/users', authMiddleware, requireRoles(Role.SUPER_ADMIN, Role.ADMIN), controller.listUsers);
router.patch('/users/:id/role', authMiddleware, requireRoles(Role.SUPER_ADMIN), controller.updateUserRole);
router.get('/system-overview', authMiddleware, requireRoles(Role.SUPER_ADMIN), controller.getSystemOverview);

// ==========================================
// Facebook Fanpage Integration (OAuth & Link)
// ==========================================
import { FacebookPageController } from './facebook-page.controller';
const fbPageController = new FacebookPageController();

router.post('/facebook/pages', authMiddleware, fbPageController.getAvailablePages);
router.post('/facebook/connect', authMiddleware, requireRoles(Role.ADMIN), fbPageController.connectPage);
router.get('/facebook/status', authMiddleware, fbPageController.getConnectionStatus);
router.post('/facebook/disconnect', authMiddleware, requireRoles(Role.ADMIN), fbPageController.disconnectPage);

export default router;
