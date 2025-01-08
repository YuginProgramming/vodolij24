import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';


class Apiuser extends Model {}
Apiuser.init({
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true
    },
    chat_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    birthdaydate: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    cards: {
        type: DataTypes.STRING,
        allowNull: true
    },
    

}, {
    freezeTableName: false,
    timestamps: true,
    modelName: 'Apiusers',
    sequelize
});

const createNewApiUser = async (userData) => {
    let res;
    try {
        res = await Apiuser.create({ ...userData });
        res = res.dataValues;
    } catch (err) {
        logger.error(`Impossible to create user: ${err}`);
    }
    return res;
};

const updateApiUserByChatId = async (chat_id, updateParams) => {
    const res = await Apiuser.update({ ...updateParams } , { where: { chat_id } });
    if (res[0]) {
        const data = await findApiUserByChatId(chat_id);
        if (data) {
            //logger.info(`Api user ${data.chat_id} updated`);
            return data;
        }
        logger.info(`Api user ${chat_id} updated, but can't read result data`);
    } 
    return undefined;
};


const findApiUserByUserId = async (user_id) => {
    const res = await Apiuser.findAll({ where: { user_id } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};

const findAllUsers = async () => {
    const res = await Apiuser.findAll({ where: {  } });
    if (res.length > 0) return res.map(el => el.dataValues);
    return;
};


const findApiUserByChatId = async (chat_id) => {
    const res = await Apiuser.findOne({ where: { chat_id: chat_id } });
    if (res) return res.dataValues;
    return res;
};

export {
    Apiuser,
    createNewApiUser,
    updateApiUserByChatId,
    findApiUserByUserId,
    findApiUserByChatId,
    findAllUsers
};