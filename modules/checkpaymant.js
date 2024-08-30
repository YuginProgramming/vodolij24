import { phrases } from "../language_ua.js";
import { bot } from "../app.js";
import getTransaction from '../transactions.js';
import { createNewBonus } from '../models/bonuses.js'
import { logger } from "../logger/index.js";

const checkPayment = async (chatID, deviceId, cardId) => {

    setTimeout(async () => {

        const transaction = await getTransaction(deviceId, 7, cardId);
        console.log(transaction);
        const paymantAmount = transaction?.cashPaymant||transaction?.cardPaymant||transaction?.onlinePaymant||'null';
        const boughtVolume = (paymantAmount/1.2).toFixed(2);
        const bonus = transaction?.waterFullfilled - boughtVolume;

        if (transaction) {

            const bonus = transaction.waterFullfilled * 0.2

            await createNewBonus(chatID, bonus, 'нарахування бонусів')

            bot.sendMessage(chatID, `Внесено: ${paymantAmount} грн, куплено: ${boughtVolume} літра за ціною 1,2 грн/літр + бонус ${bonus} літра= ${transaction.waterFullfilled} л разом 💧`);
            
            logger.info(`${chatID} Внесено: ${paymantAmount} грн, куплено: ${boughtVolume} літра за ціною 1,2 грн/літр + бонус ${bonus} літра= ${transaction.waterFullfilled} л разом 💧`)

        } else {
            bot.sendMessage(chatID, phrases.bonusNotificationCardError);
        }
    }, 60 * 1000 * 7);
    
};


export default checkPayment;

