import axios from "axios";
import { keyboards, phrases } from "../language_ua.js";
import { findApiUserByChatId, updateApiUserByChatId } from "../models/api-users.js";
import { createCard, findCardById } from "../models/cards.js";
import { updateUserByChatId, userLogin } from "../models/users.js";
import { bot } from "../app.js";

const createCardApi = async (chatId, phone) => {

    await userLogin(chatId);
    const userData = await findApiUserByChatId(chatId)
    const url = 'https://soliton.net.ua/water/api/card/link/index.php'; 
    const requestData = {
        user_id: userData.user_id,
        card_id: userData.phone,
    };
    const response = await axios.post(url, requestData);

    if(response.data.status === 'success' || response.data.error === 'card already linked to user') {
        const userCard = await axios.get(`http://soliton.net.ua/water/api/user/index.php?phone=${phone}`);

        const virtualCard = userCard.data.user.card[0]

        await updateApiUserByChatId(chatId, { cards: virtualCard.ID });

        let cardDataId;

        const card = await createCard({
                cardId: virtualCard.ID,
                Number: virtualCard.Number,
                Card: virtualCard.Card,
                Type: virtualCard.Type,
                CardGroup: virtualCard.CardGroup,
                WaterQty: virtualCard.WaterQty,
                AllQty: virtualCard.AllQty,
                MoneyPerMonth: virtualCard.MoneyPerMonth,
                LitersPerDay: virtualCard.LitersPerDay,
                Discount:  virtualCard.Discount,
                status: virtualCard.status
        });


        if (!card) {

            const card = await findCardById(virtualCard.ID);
            cardDataId = card.id;

        } else {

            cardDataId = card.id;

        }

        await updateUserByChatId (chatId, { lastname: cardDataId })
    }

    bot.sendMessage(chatId, phrases.welcomeNoCard, {
    reply_markup: { keyboard: keyboards.mainMenu, resize_keyboard: true, one_time_keyboard: true }
    });

}

export default createCardApi;

            