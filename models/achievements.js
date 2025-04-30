import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';

class Achievements extends Model {}
Achievements.init({
    code: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true
    }

}, {
    freezeTableName: false,
    timestamps: false,
    modelName: 'achievements',
    sequelize
});

const createNewBonus = async (user_id, transactionAmount, transactionType) => {
    let res;
    try {
        res = await Bonus.create({
            user_id,
            transactionAmount,
            transactionType,
        });
        res = res.dataValues;
        logger.info(`Created Bonus with id: ${res.id}`);
    } catch (err) {
        logger.error(`Impossible to create Bonus: ${err}`);
    }
    return res;
};

const findBalanceByChatId = async (user_id) => {
    const res = await Bonus.findAll({ where: { user_id } });
    if (res.length > 0) {
        const transactions = res.map(el => el.dataValues);
        const sum = transactions.reduce((total, obj) => total + obj.transactionAmount, 0);
        return sum;
    } 
    return res;
};




export {
    Achievements,
    createNewBonus,
    findBalanceByChatId
};   

