import axios from "axios";
import { bot } from "../app.js";
import { phrases } from "../language_ua.js";
import { createNewBonus } from "../models/bonuses.js";

const waterPrice = 1.5;

const getCardData = async (user_id, card_id) => {
    const url = 'https://soliton.net.ua/water/api/card/query/index.php'; 
    const requestData = {
        user_id,
        card_id,
    };
        
    const response = await axios.post(url, requestData);
    const card = response.data.card;
    return card;
}

const checkBalanceChange = async (chatId, user_id, card_id) => {
    const currentBalance = await getCardData(user_id, card_id);
    const beforeWater = currentBalance.WaterQty;
        setTimeout(async () => {
            const balance = await getCardData(user_id, card_id);
            const afterWater = balance.WaterQty;
            console.log(beforeWater)
            if (beforeWater !== afterWater) {
    
                const balanceChange = afterWater - beforeWater;
    
                sendResult(chatId, balanceChange);
    
            } else {
                setTimeout(async () => {
                    const balance = await getCardData(user_id, card_id);
                    const afterWater = balance.WaterQty;
    
                    if (beforeWater !== afterWater) {
    
                        const balanceChange = afterWater - beforeWater;
    
                        sendResult(chatId, balanceChange);
    
                    } else {
    
                        bot.sendMessage(chatId, phrases.bonusNotificationCardError);
                    }

                }, 60000 * 2);
            }

        }, 60000 * 2);    
    
};

const sendResult = async (chatId, balanceChange) => {    

    if (balanceChange > 0) {

        const liters = (balanceChange / 10).toFixed(2);   
        
        const bonusAmount = (liters * 0.2).toFixed(2)
        
        const bonus = await createNewBonus(chatId, bonusAmount, 'нарахування бонусів');

        const price = (liters * waterPrice).toFixed(2)

        bot.sendMessage(chatId, phrases.bonusNotificationCard(liters, price, bonus.transactionAmount));
    
    };
}

export {
    getCardData,
    checkBalanceChange
}
        
    

