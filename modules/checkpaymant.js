import { phrases } from "../language_ua.js";
import { bot } from "../app.js";
import getTransaction from '../transactions.js';
import { createNewBonus } from '../models/bonuses.js'

const checkPayment = async (chatID, deviceId, cardId) => {

    setTimeout(async () => {

        const transaction = await getTransaction(deviceId, 7, cardId);
        console.log(transaction)

        if (transaction) {

            const bonus = transaction.waterFullfilled * 0.2

            await createNewBonus(chatID, bonus, 'нарахування бонусів')

            bot.sendMessage(chatID, `Дякуємо за покупку, на картку нараховано ${bonus} бонусних літрів`);

        } else {
            bot.sendMessage(chatID, phrases.bonusNotificationCardError);
        }
    }, 60 * 1000 * 7);
    
};


export default checkPayment;

