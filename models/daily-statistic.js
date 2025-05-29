import { Model, DataTypes, Sequelize } from "sequelize";
import { sequelize } from './sequelize.js';
import { logger } from '../logger/index.js';
import { Transaction } from "./transactions.js";
import { Op } from "sequelize";
import { BotTransaction } from "./bot-transactions.js";
import { Card, findCardById } from "./cards.js";


class DailyStatistic extends Model {}

DailyStatistic.init({
    date: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    totalWater: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    totalTransactions: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    uniqueUsers: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    topUserId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    topUserVolume: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    topDeviceId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    topDeviceTransactions: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    topDeviceVolume: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    totalRevenue: { // Загальна виручка за день
        type: DataTypes.FLOAT,
        allowNull: false
    },
    cashRevenue: { // Виручка готівкою
        type: DataTypes.FLOAT,
        allowNull: false
    },
    cardRevenue: { // Виручка карткою
        type: DataTypes.FLOAT,
        allowNull: false
    },
    onlineRevenue: { // Виручка онлайн
        type: DataTypes.FLOAT,
        allowNull: false
    },
    failedTransactions: { // Кількість невдалих транзакцій
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: true,
    modelName: 'daily_statistics',
    sequelize
});


const collectDailyStatistics = async () => {
    const getYesterdayDateRange = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Скидаємо години, хвилини, секунди
        const startOfYesterday = new Date(now);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);

        const endOfYesterday = new Date(startOfYesterday);
        endOfYesterday.setHours(23, 59, 59, 999);

        // Форматуємо дату без часу (YYYY-MM-DD)
        const statDate = startOfYesterday.toISOString().split('T')[0];

        return { startOfYesterday, endOfYesterday, statDate };
    };
   
    const { startOfYesterday, endOfYesterday, statDate } = getYesterdayDateRange();
    
    // Отримуємо всі транзакції за вчора
    const transactions = await BotTransaction.findAll({
        where: {
            date: {
                [Op.between]: [startOfYesterday, endOfYesterday]
            }
        }
    });

    // Загальні підрахунки
    const totalTransactions = transactions.length;
    const totalWater = transactions.reduce((sum, t) => sum + (t.waterFullfilled || 0), 0).toFixed(0);
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.cashPaymant || 0) + (t.cardPaymant || 0) + (t.onlinePaymant || 0), 0);
    const cashRevenue = transactions.reduce((sum, t) => sum + (t.cashPaymant || 0), 0);
    const cardRevenue = transactions.reduce((sum, t) => sum + (t.cardPaymant || 0), 0);
    const onlineRevenue = transactions.reduce((sum, t) => sum + (t.onlinePaymant || 0), 0);
    const failedTransactions = transactions.filter(t => t.waterFullfilled === 0).length;

    // Визначаємо топового користувача за обсягом налитої води
    const userStats = {};
    transactions.forEach(t => {
        if (t.cardId) {
            userStats[t.cardId] = (userStats[t.cardId] || 0) + (t.waterFullfilled || 0);
        }
    });   

    const topUserId = Object.keys(userStats).length ? Object.keys(userStats).reduce((a, b) => userStats[a] > userStats[b] ? a : b) : null;
    const topUserVolume = topUserId ? userStats[topUserId].toFixed(0) : 0;

    
    // Визначаємо топовий автомат
    const deviceStats = {};
    transactions.forEach(t => {
        deviceStats[t.device] = deviceStats[t.device] || { count: 0, volume: 0 };
        deviceStats[t.device].count += 1;
        deviceStats[t.device].volume += t.waterFullfilled || 0;
    });

    const topDeviceId = Object.keys(deviceStats).length ? Object.keys(deviceStats).reduce((a, b) => deviceStats[a].count > deviceStats[b].count ? a : b) : null;
    const topDeviceTransactions = topDeviceId ? deviceStats[topDeviceId].count : 0;
    const topDeviceVolume = topDeviceId ? deviceStats[topDeviceId].volume : 0;

    // Записуємо дані у таблицю daily_statistics
    await DailyStatistic.create({
        date: statDate,
        totalWater,
        totalTransactions,
        uniqueUsers: Object.keys(userStats).length,
        topUserId,
        topUserVolume,
        topDeviceId,
        topDeviceTransactions,
        topDeviceVolume,
        totalRevenue,
        cashRevenue,
        cardRevenue,
        onlineRevenue,
        failedTransactions
    });

};

export {
    collectDailyStatistics,
    DailyStatistic,
}

