import {User, Order} from '../models/index.js';

class NotificationService {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.processInterval = null;

        this.startProcessing();
    }

    addToQueue(type, data) {
        const task = {
            id: Date.now() + Math.random(),
            type,
            data,
            attempts: 0,
            maxAttempts: 3,
            createdAt: new Date()
        };

        this.queue.push(task);
        console.log(`Задача добавлена в очередь: ${type}`, data);
    }

    startProcessing() {
        if (this.processInterval) return;

        this.processInterval = setInterval(async () => {
            if (!this.processing && this.queue.length > 0) {
                await this.processQueue();
            }
        }, 5000);

        console.log('Обработка очереди уведомлений запущена');
    }

    stopProcessing() {
        if (this.processInterval) {
            clearInterval(this.processInterval);
            this.processInterval = null;
        }
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;
        console.log(`Обработка очереди: ${this.queue.length} задач`);

        const failedTasks = [];

        for (const task of this.queue) {
            try {
                await this.processTask(task);
                console.log(`Задача выполнена: ${task.type} (${task.id})`);
            } catch (error) {
                task.attempts++;
                console.error(`Ошибка выполнения задачи ${task.type} (попытка ${task.attempts}):`, error.message);

                if (task.attempts < task.maxAttempts) {
                    failedTasks.push(task);
                } else {
                    console.error(`Задача ${task.type} (${task.id}) отброшена после ${task.maxAttempts} попыток`);
                }
            }
        }

        this.queue = failedTasks;
        this.processing = false;
    }
    async processTask(task) {
        switch (task.type) {
            case 'orderCreated':
                await this.sendOrderCreatedNotification(task.data);
                break;
            case 'orderStatusChanged':
                await this.sendOrderStatusChangedNotification(task.data);
                break;
            case 'orderCancelled':
                await this.sendOrderCancelledNotification(task.data);
                break;
            default:
                throw new Error(`Неизвестный тип задачи: ${task.type}`);
        }
    }

    async sendOrderCreatedNotification(data) {
        const {orderId, userId} = data;

        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email']
        });

        const order = await Order.findByPk(orderId);

        if (!user || !order) {
            throw new Error('Пользователь или заказ не найден');
        }

        await this.sendEmail({
            to: user.email,
            subject: `Заказ #${order.id} создан`,
            template: 'orderCreated',
            data: {
                userName: user.name,
                orderId: order.id,
                totalAmount: order.total_amount,
                estimatedDelivery: order.estimated_delivery
            }
        });
    }

    async sendOrderStatusChangedNotification(data) {
        const {orderId, userId, newStatus} = data;

        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email']
        });

        if (!user) {
            throw new Error('Пользователь не найден');
        }

        const statusNames = {
            pending: 'ожидает подтверждения',
            confirmed: 'подтвержден',
            rejected: 'отклонен',
            cancelled: 'отменен',
            shipped: 'отправлен',
            delivered: 'доставлен'
        };

        await this.sendEmail({
            to: user.email,
            subject: `Заказ #${orderId} - ${statusNames[newStatus]}`,
            template: 'orderStatusChanged',
            data: {
                userName: user.name,
                orderId,
                newStatus: statusNames[newStatus]
            }
        });
    }
    async sendOrderCancelledNotification(data) {
        const {orderId, userId} = data;

        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email']
        });

        if (!user) {
            throw new Error('Пользователь не найден');
        }

        await this.sendEmail({
            to: user.email,
            subject: `Заказ #${orderId} отменен`,
            template: 'orderCancelled',
            data: {
                userName: user.name,
                orderId
            }
        });
    }

    async sendEmail({to, subject, template, data}) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        console.log(`📧 Email отправлен:
        Кому: ${to}
        Тема: ${subject}
        Шаблон: ${template}
        Данные:`, data);

        if (Math.random() < 0.1) {
            throw new Error('Временная ошибка сервиса email');
        }
    }

    getQueueStats() {
        return {
            queueLength: this.queue.length,
            processing: this.processing,
            tasks: this.queue.map(task => ({
                id: task.id,
                type: task.type,
                attempts: task.attempts,
                createdAt: task.createdAt
            }))
        };
    }
}

export default new NotificationService();