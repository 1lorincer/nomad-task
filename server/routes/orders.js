import {Router} from 'express';
import OrderController from '../controllers/order.controller.js';
import {authRequired} from "../middleware/auth.js";

const router = Router();

router.use(authRequired);

router.post('/', OrderController.create);

router.get('/', OrderController.getAll);

router.get('/:id', OrderController.getById);

router.patch('/:id/status', OrderController.updateStatus);

router.patch('/:id/cancel', OrderController.cancel);
export default router;