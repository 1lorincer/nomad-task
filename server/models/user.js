import {DataTypes} from "sequelize";

export default (sequelize) => {
    const User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        firstName: {type: DataTypes.STRING},
        lastName: {type: DataTypes.STRING},
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user'}
    }, {
        tableName: 'users',
        underscored: true,
    })
    return User;
}