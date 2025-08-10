import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const OrderItem = sequelize.define(
        'OrderItem',
        {
            quantity: { type: DataTypes.INTEGER, allowNull: false },
            priceAtMoment: { type: DataTypes.DECIMAL(10,2), allowNull: false }
        },
        { tableName: 'order_items', underscored: true }
    );
    return OrderItem;
};
