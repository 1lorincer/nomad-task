import {Router} from 'express';
import UserController from '../controllers/user.controller.js';
import {authRequired, requireRole, attachUser} from '../middleware/auth.js';

const router = Router();

router.get('/me', authRequired, attachUser, UserController.me);

router.get('/', authRequired, requireRole('admin'), UserController.list);

export default router;
