import {Router} from 'express';
import authRoutes from './auth.js';
import userRoutes from './user.js';
import productRoutes from './products.js';
import orderRoutes from './orders.js';

const api = Router();

api.use('/auth', authRoutes);
api.use('/users', userRoutes);
api.use('/products', productRoutes);
api.use('/orders', orderRoutes);

export default api;
