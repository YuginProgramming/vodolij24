import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';

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
        type: DataTypes.INTEGER,
        allowNull: true
    },
    waterFullfilled: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    cashPaymant: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    cardPaymant: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    onlinePaymant: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    paymantChange: {
        type: DataTypes.INTEGER,
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
        logger.info(`Created transaction with id: ${res.id}`);
    } catch (err) {
        logger.error(`Impossible to create transaction: ${err}`);
    }
    return res;
};



export {
    Transaction,
    createNewTransaction
};   

