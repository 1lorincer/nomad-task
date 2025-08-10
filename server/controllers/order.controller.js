import {sequelize, Order, OrderItem, Product} from '../models/index.js';

class OrderController {
    async create(req, res) {
        const {userId, items, shippingCost = 0} = req.body;
        const tx = await sequelize.transaction();
        try {
            const order = await Order.create({user_id: userId, shippingCost, status: 'pending'}, {transaction: tx});

            for (const it of items) {
                const product = await Product.findByPk(it.productId, {transaction: tx, lock: tx.LOCK.UPDATE});
                if (!product || product.stock < it.quantity) {
                    await tx.rollback();
                    return res.status(400).json({message: `Недостаточно на складе: product ${it?.productId}`});
                }

                await product.update({stock: product.stock - it.quantity}, {transaction: tx});

                await OrderItem.create({
                    order_id: order.id, product_id: product.id, quantity: it.quantity, priceAtMoment: product.price
                }, {transaction: tx});
            }

            await order.update({status: 'confirmed'}, {transaction: tx});
            await tx.commit();
            res.status(201).json({id: order.id});
        } catch (e) {
            await tx.rollback();
            res.status(500).json({message: 'Ошибка создания заказа', error: e.message});
        }
    }
}

export default new OrderController();
