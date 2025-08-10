import {DataTypes} from 'sequelize';

export default (sequelize) => {
    const Order = sequelize.define(
        'Order',
        {
            shippingCost: {type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0},
            status: {type: DataTypes.ENUM('pending', 'confirmed', 'rejected', 'cancelled'), defaultValue: 'pending'}
        },
        {tableName: 'orders', underscored: true}
    );
    return Order;
};
