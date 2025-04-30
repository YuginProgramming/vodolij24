import { Model, DataTypes } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';

class UserAchievements extends Model {}
UserAchievements.init({
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    achievement_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    achieved_at: {
        type: DataTypes.STRING,
        allowNull: true
    }

}, {
    freezeTableName: false,
    timestamps: false,
    modelName: 'user_achievements',
    sequelize
});

const createNewAchievement = async (user_id, achievement_id) => {
    let res;
    try {
        res = await UserAchievements.create({
            user_id,
            achievement_id,
        });
        res = res.dataValues;
        logger.info(`Created Achievement with id: ${res.id}`);
    } catch (err) {
        logger.error(`Impossible to create Achievement: ${err}`);
    }
    return res;
};

const findAchievementsByChatId = async (user_id) => {
    const res = await UserAchievements.findAll({ where: { user_id } });
    if (res.length > 0) {
        const achievements = res.map(el => el.dataValues);       
        return achievements;
    } 
    return res;
};




export {
    UserAchievements,
    createNewAchievement,
    findAchievementsByChatId
};   

