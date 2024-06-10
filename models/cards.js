import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';


class Card extends Model {}
Card.init({
    cardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    Number: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
    },
    Card: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    CardGroup: {
        type: DataTypes.STRING,
        allowNull: true
    },
    WaterQty: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    AllQty: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    MoneyPerMonth: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    LitersPerDay: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    Discount: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    

}, {
    freezeTableName: false,
    timestamps: true,
    modelName: 'cards',
    sequelize
});

const createCard = async (userData) => {
    let res;
    try {
        res = await Card.create({ ...userData });
        res = res.dataValues;
        logger.info(`Created card id: ${res.cardId}`);
    } catch (err) {
        logger.error(`Impossible to create card: ${err}`);
    }
    return res;
};

const updateCardById = async (cardId, updateParams) => {
    const res = await Card.update({ ...updateParams } , { where: { cardId } });
    if (res[0]) {
        const data = await findCardById(cardId);
        if (data) {
            logger.info(`Card ${cardId} updated`);
            return data;
        }
        logger.info(`Card ${cardId} updated, but can't read result data`);
    } 
    return undefined;
};


const findCardById = async (cardId) => {
    const res = await Card.findOne({ where: { cardId } });
    if (res) return res.dataValues;
    return res;
};

export {
    Card,
    createCard,
    updateCardById,
    findCardById,
};   