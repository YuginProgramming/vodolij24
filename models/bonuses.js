import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';

class Bonus extends Model {}
User.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    balance: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    transaction: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }

}, {
    freezeTableName: false,
    timestamps: true,
    modelName: 'bonuses',
    sequelize
});

export {
    Bonus
};   