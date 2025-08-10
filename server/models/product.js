import {DataTypes} from 'sequelize';

export default (sequelize) => {
    const Product = sequelize.define(
        'Product',
        {
            title: {type: DataTypes.STRING, allowNull: false},
            price: {type: DataTypes.DECIMAL(10, 2), allowNull: false},
            stock: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}
        },
        {tableName: 'products', underscored: true}
    );
    return Product;
};