import { logger } from './logger/index.js';
import { bot } from "../app.js";


const checkPaymant = (user, amount, chatID) => {
    setTimeout(() => {
        //check api for current user and amount
        if (true) {
            logger.info(`User ${user} compleate paymant ${amount}`);
            bot.sendMessage(chatID, `Дякуємо за покупку, на картку нараховано ${amount * 0.1} бонусів `)

        } else {
            logger.info(`Could not find ${amount} for ${user} in logs`);
            bot.sendMessage(chatID, `Ваш платіж не пройшов, зверніться, будь ласка, в підтримку, якщо ви завершили платіж`)

        }
    }, 7 * 60 * 1000);
}