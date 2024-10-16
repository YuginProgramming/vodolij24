import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';

import { Op } from "sequelize";

class Transaction extends Model {}
Transaction.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    device: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.STRING,
        allowNull: false
    },
    waterRequested: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    waterFullfilled: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    cashPaymant: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    cardPaymant: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    onlinePaymant: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    paymantChange: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    isAutorized: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: true
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
    // Отримуємо сьогоднішню дату у форматі 'YYYY-MM-DD'
    const todayString = today.toISOString().split('T')[0];
    
    // Отримуємо вчорашню дату у форматі 'YYYY-MM-DD'
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    try {
        // Знаходимо всі транзакції, де дата є між вчорашньою і сьогоднішньою датами
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
    /*
    const todayString = today.toISOString().split('T')[0];
    
    const yesterdayString = yesterday.toISOString().split('T')[0];
    */

     // Get the start of yesterday
     const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    
     // Get the end of yesterday
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

