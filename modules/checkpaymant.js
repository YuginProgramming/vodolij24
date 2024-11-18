import { phrases } from "../language_ua.js";
import { bot } from "../app.js";
import getTransaction from '../transactions.js';
import { logger } from "../logger/index.js";
import { getCardData } from "./checkcardAPI.js";

const checkPayment = async (chatID, deviceId, cardId, phone, user_id) => {

    setTimeout(async () => {

        const card = await getCardData(user_id, cardId);

        console.log(card);

        const transaction = await getTransaction(deviceId, 7, cardId);
        console.log(transaction);
        const paymantAmount = transaction?.cashPaymant||transaction?.cardPaymant||transaction?.onlinePaymant||'null';
        const bonus = transaction?.waterFullfilled * card?.Discount/100;
        const balance = card?.WaterQty/10;
        const price = (paymantAmount/transaction?.waterFullfilled).toFixed(1);

        if (transaction) {

            if (transaction?.cashPaymant) {

                if (transaction?.paymantChange == 0) {

                    bot.sendMessage(chatID, `Внесено: ${paymantAmount} грн, куплено: ${transaction?.waterFullfilled} літрів за ціною ${price} грн/літр.
Плюс на Ваш баланс нараховано бонус ${bonus} літра, загалом баланс складає ${balance} літра. Дякуємо за покупку, пийте на здоров'я 💧`);

                } else {

                    bot.sendMessage(chatID, `Внесено: ${paymantAmount} грн, куплено: ${transaction?.waterFullfilled} літрів за ціною ${price} грн/літр. Решта ${transaction?.paymantChange} зарахована на ваш баланс
                    Плюс на Ваш баланс нараховано бонус ${bonus} літра, загалом баланс складає ${balance} літра. Дякуємо за покупку, пийте на здоров'я 💧`);
                    
                }
                
            } if (transaction?.onlinePaymant) {

                if (transaction?.paymantChange == 0) {

                    bot.sendMessage(chatID, `Внесено: ${paymantAmount} грн, куплено: ${transaction?.waterFullfilled} літрів за ціною ${price} грн/літр.
Плюс на Ваш баланс нараховано бонус ${bonus} літра, загалом баланс складає ${balance} літра. Дякуємо за покупку, пийте на здоров'я 💧`);

                } else {

                    bot.sendMessage(chatID, `Внесено: ${paymantAmount} грн, куплено: ${transaction?.waterFullfilled} літрів за ціною ${price} грн/літр. Решта ${transaction?.paymantChange} зарахована на ваш баланс
                    Плюс на Ваш баланс нараховано бонус ${bonus} літра, загалом баланс складає ${balance} літра. Дякуємо за покупку, пийте на здоров'я 💧`);
                    
                }

            }
            
            logger.info(`#️⃣ ${chatID} 📱 ${phone} Внесено: ${paymantAmount} грн, куплено: ${transaction?.waterFullfilled} літра за ціною ${price} грн/літр + бонус ${bonus} літра= ${transaction?.waterFullfilled} л разом 💧`)

        } else {
            bot.sendMessage(chatID, phrases.bonusNotificationCardError);
        }
    }, 60 * 1000 * 7);
    
};


export default checkPayment;

