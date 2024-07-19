import axios from "axios";
import { bot } from "../app.js";
import { phrases } from "../language_ua.js";
import { createNewBonus } from "../models/bonuses.js";

const waterPrice = 1.2;

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
            console.log(balance)
            const afterWater = balance.WaterQty;
            console.log(beforeWater)
            if (beforeWater !== afterWater) {
    
                const balanceChange = afterWater - beforeWater;
    
                sendResult(chatId, balanceChange, balance.Discount);
    
            } else {
                setTimeout(async () => {
                    const balance = await getCardData(user_id, card_id);
                    const afterWater = balance.WaterQty;
    
                    if (beforeWater !== afterWater) {
    
                        const balanceChange = afterWater - beforeWater;
    
                        sendResult(chatId, balanceChange, balance.Discount);
    
                    } else {
    
                        bot.sendMessage(chatId, phrases.bonusNotificationCardError);
                    }

                }, 60000 * 2);
            }

        }, 60000 * 2);    
    
};

const sendResult = async (chatId, balanceChange, discount) => {    

    if (balanceChange > 0) {
        console.log(balanceChange);

        const liters = (balanceChange / 10).toFixed(2);   
        
        const bonusAmount = (liters * discount/100).toFixed(2);
        
        const bonus = await createNewBonus(chatId, bonusAmount, 'нарахування бонусів');

        const price = (liters * waterPrice).toFixed(0);

        const total = (liters * 1 + bonusAmount * 1).toFixed(2);

        bot.sendMessage(chatId, phrases.bonusNotificationCard(liters, price, bonus.transactionAmount, waterPrice, total));
    
    };
}

export {
    getCardData,
    checkBalanceChange
}
        
    

