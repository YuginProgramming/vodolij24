import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';

import { Op } from "sequelize";

class Transaction extends Model {}
Transaction.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false
    },
    device: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false
    },
    date: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    waterRequested: {
        type: DataTypes.FLOAT,
        allowNull: true,
        unique: false
    },
    waterFullfilled: {
        type: DataTypes.FLOAT,
        allowNull: true,
        unique: false
    },
    cashPaymant: {
        type: DataTypes.FLOAT,
        allowNull: true,
        unique: false
    },
    cardPaymant: {
        type: DataTypes.FLOAT,
        allowNull: true,
        unique: false
    },
    onlinePaymant: {
        type: DataTypes.FLOAT,
        allowNull: true,
        unique: false
    },
    paymantChange: {
        type: DataTypes.FLOAT,
        allowNull: true,
        unique: false
    },
    isAutorized: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        unique: false
    },
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false
    }

}, {
    freezeTableName: false,
    timestamps: true,
    modelName: 'transactions',
    sequelize
});

const createNewTransaction = async (transactionData) => {
    let res;
    try {
        res = await Transaction.create({ ...transactionData });
        res = res.dataValues;
        //logger.info(`Created transaction with id: ${res.id}`);
    } catch (err) {
        logger.error(`Impossible to create transaction: ${err}`);
    }
    return res;
};

const getWaterTotalbyTheDay = async () => {
    let res;
    
    const today = new Date();
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayString = today.toISOString().split('T')[0];
    

    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    try {

        const totalWaterFulfilled = await Transaction.sum('waterFullfilled', {
            where: {
                date: {
                    [Op.between]: [yesterdayString, todayString]
                }
            }
        });

        return totalWaterFulfilled;
    
    } catch (err) {
        logger.error(`Impossible to request sum: ${err}`);
    }
    return res;
};

const getUsersTotalbyTheDay = async (cardId) => {
    let res = 0;
    
    const today = new Date();
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));
    
    try {
        const totalWaterFulfilled = await Transaction.sum('waterFullfilled', {
            where: {

                cardId,

                date: {
                    [Op.between]: [startOfYesterday, endOfYesterday]
                }

            }
        });

        return totalWaterFulfilled || 0; 
    
    } catch (err) {
        logger.error(`Impossible to request sum: ${err}`);
    }
    return res;
};


export {
    Transaction,
    createNewTransaction,
    getWaterTotalbyTheDay,
    getUsersTotalbyTheDay
};   

