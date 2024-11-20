import { phrases } from "../language_ua.js";
import { bot } from "../app.js";
import getTransaction from '../transactions.js';
import { logger } from "../logger/index.js";
import { getCardData } from "./checkcardAPI.js";
import axios from "axios";

const checkPayment = async (chatID, deviceId, cardId, phone, user_id) => {

    setTimeout(async () => {

        const card = await getCardData(user_id, cardId);

        console.log(card);

        const transaction = await getTransaction(deviceId, 4, cardId);
        console.log(transaction);
        const paymantAmount = transaction?.cashPaymant||transaction?.cardPaymant||transaction?.onlinePaymant||'null';
        
        const balance = card?.WaterQty/10;
        const deviceData = await axios.post('https://soliton.net.ua/water/api/prices/index.php', 
            {
                device_id: deviceId
            }
        );

        const devicePrices = deviceData.data?.prices

        const price = devicePrices?.P_1_std/100;

        const bonus = paymantAmount / price * card?.Discount/100;

        if (transaction) {


            bot.sendMessage(chatID, `Внесено: ${paymantAmount} грн, куплено: ${transaction?.waterFullfilled} літрів за ціною ${price} грн/літр.
Плюс на Ваш баланс нараховано бонус ${bonus} літра, загалом баланс складає ${balance} літра. Дякуємо за покупку, пийте на здоров'я 💧`);

            
            logger.info(`#️⃣ ${chatID} 📱 ${phone} Внесено: ${paymantAmount} грн, куплено: ${transaction?.waterFullfilled} літра за ціною ${price} грн/літр + бонус ${bonus} літра= ${transaction?.waterFullfilled} л разом 💧`)

        } else {

            bot.sendMessage(chatID, phrases.bonusNotificationCardError);

        }

    }, 60 * 1000 * 4);
    
};


export default checkPayment;

