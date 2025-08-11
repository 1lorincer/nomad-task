// models/order-item.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const OrderItem = sequelize.define(
        'OrderItem',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            order_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'orders',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            product_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: {
                        args: [1],
                        msg: 'Количество должно быть больше 0'
                    }
                }
            },
            price_at_moment: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                validate: {
                    min: {
                        args: [0],
                        msg: 'Цена не может быть отрицательной'
                    }
                }
            }
        },
        {
            tableName: 'order_items',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',

            // Хуки для автоматического обновления updated_at
            hooks: {
                beforeUpdate: (orderItem, options) => {
                    orderItem.updated_at = new Date();
                }
            },

            // Индексы для оптимизации
            indexes: [
                {
                    fields: ['order_id']
                },
                {
                    fields: ['product_id']
                },
                {
                    unique: true,
                    fields: ['order_id', 'product_id'],
                    name: 'unique_order_product'
                }
            ]
        }
    );

    return OrderItem;
};