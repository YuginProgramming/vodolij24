import { phrases } from "../language_ua.js";
import { bot } from "../app.js";
import getUserTransactions from '../user-transactions.js';
import { logger } from "../logger/index.js";
import { getCardData } from "./checkcardAPI.js";
import axios from "axios";

const checkPayment = async (chatID, deviceId, cardId, phone, user_id) => {

    setTimeout(async () => {

        const card = await getCardData(user_id, cardId);

        console.log(card);

        const transaction = await getUserTransactions(deviceId, 4, cardId);
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
            if (transaction.cardPaymant !== 0) {
                bot.sendMessage(chatID, `Набрано ${transaction?.waterFullfilled} л. з балансу. 
Залишок на балансі складає ${balance} л. Дякуємо, пийте на здоров'я`);                    
                                
                logger.info(`#️⃣ ${chatID} 📱 ${phone} З балансу карти налито: ${transaction?.waterFullfilled} л.  за ціною ${price} грн/літр`)
            } else if (transaction.cardPaymant == 0 || transaction.cashPaymant == 0 || transaction?.onlinePaymant == 0) {
                logger.info(`#️⃣ ${chatID} 📱 ${phone} Активував автомат але не завершив оплату`)
            } else {

                bot.sendMessage(chatID, `Внесено: ${paymantAmount} грн, налито: ${transaction?.waterFullfilled} л. за ціною ${price} грн/літр.
                    Плюс на Ваш баланс нараховано бонус ${bonus} л., загалом баланс складає ${balance} л.. Дякуємо за покупку, пийте на здоров'я 💧`);
                    
                                
                logger.info(`#️⃣ ${chatID} 📱 ${phone} Внесено: ${paymantAmount} грн, налито: ${transaction?.waterFullfilled} л. за ціною ${price} грн/літр + бонус ${bonus} л.`)
                    
            }
            
        } else {

            logger.info(`#️⃣ ${chatID} 📱 ${phone} Активував автомат для оплати готівкою але не завершив оплату`);

        }

    }, 60 * 1000 * 4);
    
};

const checkPaymentCard = async (chatID, deviceId, cardId, phone, user_id) => {

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
            if (transaction.cardPaymant !== 0) {
                bot.sendMessage(chatID, `Набрано ${transaction?.waterFullfilled} л. з балансу. 
Залишок на балансі складає ${balance} л. Дякуємо, пийте на здоров'я`);                    
                                
                logger.info(`#️⃣ ${chatID} 📱 ${phone} З балансу карти налито: ${transaction?.waterFullfilled} л.  за ціною ${price} грн/літр`)
            } else if (transaction.cardPaymant == 0 || transaction.cashPaymant == 0 || transaction?.onlinePaymant == 0) {
                logger.info(`#️⃣ ${chatID} 📱 ${phone} Активував автомат але не завершив оплату`)
            } else {

                bot.sendMessage(chatID, `Внесено: ${paymantAmount} грн, налито: ${transaction?.waterFullfilled} л. за ціною ${price} грн/літр.
                    Плюс на Ваш баланс нараховано бонус ${bonus} л., загалом баланс складає ${balance} л.. Дякуємо за покупку, пийте на здоров'я 💧`);
                    
                                
                logger.info(`#️⃣ ${chatID} 📱 ${phone} Внесено: ${paymantAmount} грн, налито: ${transaction?.waterFullfilled} л. за ціною ${price} грн/літр + бонус ${bonus} л.`)
                    
            }
            
        } else {

            logger.info(`#️⃣ ${chatID} 📱 ${phone} Активував автомат для оплати з балансу але не завершив оплату`);

        }

    }, 60 * 1000 * 4);
    
};


export {
    checkPayment,
    checkPaymentCard
};

