import TelegramBot from 'node-telegram-bot-api';
import { anketaListiner } from './anketa.js';
import { dataBot } from './values.js';
import { decodeQR } from './qrdecode.js';
import { sequelize } from './models/sequelize.js';
import { logger } from './logger/index.js';
import getStatistic from './statistic.js';
import cron from 'node-cron';
import botUsersStatistic from './modules/statistic/bot-users-statistic.js';
import mainMenu from './menus/main.js';
import introduction from './menus/introduction.js';
import buyWater from './menus/buyWater.js';
import addToBalance from './menus/addToBalance.js';

const bot = new TelegramBot(dataBot.telegramBotToken, { polling: true });

export { bot };

const main = async () => {
    const models = {
        list:  [
            'users'
        ]
    };
    // DB
    const configTables = models.list;
    const dbInterface = sequelize.getQueryInterface();
    const checks = await Promise.all(configTables.map(configTable => {
        return dbInterface.tableExists(configTable);
    }));
    const result = checks.every(el => el === true);
    if (!result) {
        // eslint-disable-next-line no-console
        console.error(`🚩 Failed to check DB tables, see config.models.list`);
        throw (`Some DB tables are missing`);
    }
    logger.info('DB connected.');
}; 

main();


anketaListiner();
decodeQR();
mainMenu();
introduction();
buyWater();
addToBalance();



cron.schedule('0 0 * * *', () => {
    getStatistic();
    botUsersStatistic();
}, {
    scheduled: true,
    timezone: 'Europe/Kiev' 
});
