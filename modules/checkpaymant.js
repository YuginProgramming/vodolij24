import { logger } from '../logger/index.js';
import { bot } from "../app.js";
import getTransaction from '../transactions.js';
import { createNewBonus } from '../models/bonuses.js'

const checkPaymentRecursively = async (amount, chatID, deviceId, attempts = 0) => {
    if (attempts >= 5) {
        logger.info(`Haven't completed payment: ${chatID}`);
        bot.sendMessage(chatID, `Ваш платіж не пройшов, бонуси не нараховано. Зверніться, будь ласка, в підтримку, якщо ви завершили платіж.`);
        return;
    }

    if (attempts === 0) {
        setTimeout(async () => {
            await checkPaymentRecursively(amount, chatID, deviceId, attempts + 1);
        }, 60 * 1000);
        return;
    }

    const transaction = await getTransaction(deviceId);
    console.log(transaction)

    if (transaction) {
        await createNewBonus(chatID, transaction.waterFullfilled * 0.1, 'нарахування бонусів')
        logger.info(`User: ${chatID} completed payment ${transaction.waterFullfilled}`);
        bot.sendMessage(chatID, `Дякуємо за покупку, на картку нараховано ${transaction.waterFullfilled * 0.1} бонусних літрів`);
    } else {
        setTimeout(async () => {
            await checkPaymentRecursively(amount, chatID, deviceId, attempts + 1);
        }, 60 * 1000);
    }
};


export default checkPaymentRecursively;

