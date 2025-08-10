import sequelize from "../config/database.js"
import userFactory from './user.js';
import productFactory from './product.js';
import orderFactory from './order.js';
import orderItemFactory from './order-item.js';

const User = userFactory(sequelize);
const Product = productFactory(sequelize);
const Order = orderFactory(sequelize);
const OrderItem = orderItemFactory(sequelize);

// ассоциации
User.hasMany(Order, {foreignKey: 'user_id'});
Order.belongsTo(User, {foreignKey: 'user_id'});

Order.belongsToMany(Product, {through: OrderItem, foreignKey: 'order_id'});
Product.belongsToMany(Order, {through: OrderItem, foreignKey: 'product_id'});

Order.hasMany(OrderItem, {foreignKey: 'order_id'});
OrderItem.belongsTo(Order, {foreignKey: 'order_id'});

Product.hasMany(OrderItem, {foreignKey: 'product_id'});
OrderItem.belongsTo(Product, {foreignKey: 'product_id'});

export {sequelize, User, Product, Order, OrderItem};
