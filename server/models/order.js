// models/order.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Order = sequelize.define(
        'Order',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            user_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            shipping_cost: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            total_amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            status: {
                type: DataTypes.ENUM(
                    'pending',
                    'confirmed',
                    'rejected',
                    'cancelled',
                    'shipped',
                    'delivered'
                ),
                allowNull: false,
                defaultValue: 'pending'
            },
            delivery_address: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            estimated_delivery: {
                type: DataTypes.DATE,
                allowNull: true
            },
            tracking_number: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        },
        {
            tableName: 'orders',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',

            hooks: {
                beforeUpdate: (order, options) => {
                    order.updated_at = new Date();
                }
            },

            indexes: [
                {
                    fields: ['user_id']
                },
                {
                    fields: ['status']
                },
                {
                    fields: ['created_at']
                },
                {
                    fields: ['user_id', 'status']
                }
            ]
        }
    );

    return Order;
};