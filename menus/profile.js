import { bot } from "../app.js";
import { keyboards, phrases } from "../language_ua.js";
import { findApiUserByChatId } from "../models/api-users.js";
import { findCardById, updateCardById } from "../models/cards.js";
import { getUsersTotalByWeek, getUsersTotalbyTheDay } from "../models/transactions";
import { findUserByChatId } from "../models/users.js";
import { getCardData } from "../modules/checkcardAPI";
import createCardApi from "../modules/createCard.js";


const profile = async () => {
  bot.on('message', async (msg) => {

    const chatId = msg.chat.id; 
        
    const apiData = await findApiUserByChatId(chatId); 

    let card = {};

    if (apiData?.cards) {
      card = await findCardById(apiData?.cards);
    }
      
    const userInfo = await findUserByChatId(chatId);

    let dialogueStatus, tempData, userDatafromApi, balance, cardNumber, cardCard;

    if (userInfo) {
        dialogueStatus = userInfo.dialoguestatus;

        if (userInfo.hasOwnProperty("lastname")) {
          console.log(userInfo.lastname)
          const data = JSON.parse(userInfo.lastname);
          console.log(data)
          userDatafromApi = data;
        }
        if (userInfo.hasOwnProperty("fathersname")) {
          tempData = userInfo.fathersname;
        }
        if (userInfo.hasOwnProperty("goods")) {
          balance = userInfo.goods;
        }
        if (card.hasOwnProperty("Number")) {
          cardNumber = card?.Number;
        }          
        if (card.hasOwnProperty("Card")) {
          cardCard = card.cardId;
        }
        
    }
   
    
    switch (msg.text) {

      case 'Ввести номер автомата': 
        bot.sendMessage(msg.chat.id, phrases.enterVendorNum);
        break;
        
      case '👤 Мій профіль':

      const cardId = apiData?.cards;

      console.log(`user Data API ${userDatafromApi}, card ID ${cardId}`)

      const card = await getCardData(userDatafromApi, cardId)

      console.log(card)

        await updateCardById( cardId,
          {
            WaterQty: card.WaterQty,
            AllQty: card.AllQty,
            MoneyPerMonth: card.MoneyPerMonth,
            LitersPerDay: card.LitersPerDay,
            Discount:  card.Discount,
          }
        )
        
        const nextLevel = (discount, turnover) => {
          if (discount == 20) {
            return 1000 - turnover;
          } else if (discount == 25) {
            return 2000 - turnover;
          } else {
            return 'максимальна знижка';
          }
        }
        
       
        const balanceMessage = `
👤 *Клієнт:* _${apiData?.name}_

💳 *Тип картки:* _${card.CardGroup}_

💰 *Поточний баланс:*
${card.WaterQty / 10} л.

🎁 *Бонусний профіль:* _${card.Discount}%_
📈 *До наступного бонусного профілю залишилося набрати:* ${nextLevel(card.Discount, card.AllQty)} л.

🔄 *Всього через картку налито:* ${card.AllQty} л.
`;

        bot.sendMessage(msg.chat.id, balanceMessage, {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: keyboards.mainMenuButton,
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });

        const userDaylyTotal = await getUsersTotalbyTheDay(cardId);

        const userWeeklyTotal = await getUsersTotalByWeek(cardId);

        const userMonthlyTotal = await getUsersTotalByWeek(cardId);

        const usageMessage = `
📊 *Статистика використання пального:*

🗓️ *Сьогодні:* ${userDaylyTotal} л.
📅 *За останній тиждень:* ${userWeeklyTotal} л.
🗓️ *За останній місяць:* ${userMonthlyTotal} л.
`;

        bot.sendMessage(msg.chat.id, usageMessage, {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: keyboards.mainMenuButton,
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });

        break;        

    };    

  });

};

export default profile;