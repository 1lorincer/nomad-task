import {sequelize, Order, OrderItem, Product, User} from '../models/index.js';
import NotificationService from '../service/notification.service.js';
import ExternalApiService from '../service/external-api.service.js';

class OrderController {
    async create(req, res) {
        const {items, shippingCost = 0, deliveryAddress, notes} = req.body;
        const {id: userId} = req.user;
        const tx = await sequelize.transaction();

        try {
            for (const item of items) {
                const product = await Product.findByPk(item.productId, {
                    transaction: tx
                });

                if (!product) {
                    await tx.rollback();
                    return res.status(400).json({
                        message: `Товар с ID ${item.productId} не найден`
                    });
                }

                if (product.stock < item.quantity) {
                    await tx.rollback();
                    return res.status(400).json({
                        message: `Недостаточно на складе: ${product.title}. Доступно: ${product.stock}, запрошено: ${item.quantity}`
                    });
                }
            }
            const order = await Order.create({
                user_id: userId,
                shipping_cost: parseFloat(shippingCost),
                delivery_address: deliveryAddress,
                notes: notes,
                status: 'pending'
            }, {transaction: tx});

            let totalAmount = 0;
            for (const item of items) {
                const product = await Product.findByPk(item.productId, {
                    transaction: tx,
                    lock: true
                });

                await product.update({
                    stock: product.stock - item.quantity
                }, {transaction: tx});

                await OrderItem.create({
                    order_id: order.id,
                    product_id: product.id,
                    quantity: item.quantity,
                    price_at_moment: parseFloat(product.price)
                }, {transaction: tx});

                totalAmount += parseFloat(product.price) * item.quantity;
            }

            await order.update({
                total_amount: totalAmount + parseFloat(shippingCost),
                status: 'confirmed'
            }, {transaction: tx});

            await tx.commit();

            try {
                const shippingInfo = await ExternalApiService.calculateShipping({
                    orderId: order.id,
                    totalAmount: totalAmount,
                    deliveryAddress: deliveryAddress
                });

                if (shippingInfo?.estimatedDelivery || shippingInfo?.trackingNumber) {
                    await order.update({
                        estimated_delivery: shippingInfo.estimatedDelivery,
                        tracking_number: shippingInfo.trackingNumber
                    });
                }
            } catch (externalError) {
                console.log('Ошибка внешнего сервиса:', externalError.message);
            }

            if (NotificationService?.addToQueue) {
                NotificationService.addToQueue('orderCreated', {
                    orderId: order.id,
                    userId: userId
                });
            }

            res.status(201).json({
                id: order.id,
                totalAmount: totalAmount + parseFloat(shippingCost),
                status: 'confirmed',
                message: 'Заказ успешно создан'
            });

        } catch (error) {
            await tx.rollback();
            console.error('Ошибка создания заказа:', error);
            res.status(500).json({
                message: 'Ошибка создания заказа',
                error: error.message
            });
        }
    }

    async getAll(req, res) {
        try {
            const {id: userId, role} = req.user;

            let whereClause = {};
            if (role !== 'admin') {
                whereClause.user_id = userId;
            }

            const orders = await Order.findAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    },
                    {
                        model: OrderItem,
                        include: [{
                            model: Product,
                            attributes: ['id', 'title', 'price']
                        }]
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            res.json(orders);
        } catch (error) {
            console.error('Ошибка получения заказов:', error);
            res.status(500).json({
                message: 'Ошибка получения заказов',
                error: error.message
            });
        }
    }

    async getById(req, res) {
        try {
            const {id} = req.params;
            const {id: userId, role} = req.user;

            let whereClause = {id: parseInt(id)};
            if (role !== 'admin') {
                whereClause.user_id = userId;
            }

            const order = await Order.findOne({
                where: whereClause,
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: OrderItem,
                        include: [{
                            model: Product,
                            attributes: ['id', 'title', 'price']
                        }]
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({message: 'Заказ не найден'});
            }

            res.json(order);
        } catch (error) {
            console.error('Ошибка получения заказа:', error);
            res.status(500).json({
                message: 'Ошибка получения заказа',
                error: error.message
            });
        }
    }

    async updateStatus(req, res) {
        try {
            const {id} = req.params;
            const {status} = req.body;
            const {role} = req.user;

            if (role !== 'admin') {
                return res.status(403).json({message: 'Недостаточно прав доступа'});
            }

            const validStatuses = ['pending', 'confirmed', 'rejected', 'cancelled', 'shipped', 'delivered'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    message: 'Некорректный статус',
                    validStatuses: validStatuses
                });
            }

            const order = await Order.findByPk(parseInt(id));
            if (!order) {
                return res.status(404).json({message: 'Заказ не найден'});
            }

            if (order.status === 'cancelled' || order.status === 'delivered') {
                return res.status(400).json({
                    message: 'Нельзя изменить статус отмененного или доставленного заказа'
                });
            }

            const oldStatus = order.status;
            await order.update({status});
            if (NotificationService?.addToQueue) {
                NotificationService.addToQueue('orderStatusChanged', {
                    orderId: order.id,
                    userId: order.user_id,
                    oldStatus: oldStatus,
                    newStatus: status
                });
            }

            res.json({
                message: 'Статус заказа обновлен',
                order: {
                    id: order.id,
                    status: status
                }
            });
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            res.status(500).json({
                message: 'Ошибка обновления статуса',
                error: error.message
            });
        }
    }

    async cancel(req, res) {
        const {id} = req.params;
        const {id: userId, role} = req.user;
        const tx = await sequelize.transaction();

        try {
            let whereClause = {
                id: parseInt(id),
                status: ['pending', 'confirmed']
            };

            if (role !== 'admin') {
                whereClause.user_id = userId;
            }

            const order = await Order.findOne({
                where: whereClause,
                include: [{
                    model: OrderItem
                }],
                transaction: tx
            });

            if (!order) {
                await tx.rollback();
                return res.status(404).json({
                    message: 'Заказ не найден или не может быть отменен'
                });
            }

            for (const item of order.OrderItems) {
                const product = await Product.findByPk(item.product_id, {
                    transaction: tx,
                    lock: true
                });

                if (product) {
                    await product.update({
                        stock: product.stock + item.quantity
                    }, {transaction: tx});
                }
            }

            await order.update({status: 'cancelled'}, {transaction: tx});
            await tx.commit();

            if (NotificationService?.addToQueue) {
                NotificationService.addToQueue('orderCancelled', {
                    orderId: order.id,
                    userId: order.user_id
                });
            }

            res.json({
                message: 'Заказ отменен',
                orderId: order.id
            });
        } catch (error) {
            await tx.rollback();
            console.error('Ошибка отмены заказа:', error);
            res.status(500).json({
                message: 'Ошибка отмены заказа',
                error: error.message
            });
        }
    }
}

export default new OrderController();