import {Router} from 'express';
import ProductController from '../controllers/product.controller.js';

const router = Router();

router.get('/', ProductController.list);
router.post('/', ProductController.create);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.remove);

export default router;
