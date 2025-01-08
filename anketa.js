import { bot } from "./app.js";
import { phrases, keyboards } from './language_ua.js';
import { 
  updateUserByChatId,
  findUserByChatId,
} from './models/users.js';
import axios from 'axios';
import { findNearestCoordinate } from './modules/locations.js';
import { logger } from "./logger/index.js";
import { findApiUserByChatId } from './models/api-users.js';
import { findCardById, updateCardById } from "./models/cards.js";
import { getCardData, checkBalanceChange } from './modules/checkcardAPI.js';
import activateDevice from "./modules/activate-device.js";
import createCardApi from "./modules/createCard.js";

export const anketaListiner = async() => {

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
      //Незрозуміло чи це працюючий код закоментю 

      if (msg.text) {
        
        const command = msg.text.split('%');

        if (command && command[0] === 'linkCard') {
  
          await createCardApi(command[1], command[2]);
  
        }
      }

      
      
      switch (msg.text) {
        case 'Ввести номер автомата': 
          bot.sendMessage(msg.chat.id, phrases.selectGoods, {
            reply_markup: keyboards.twoWaters
          });
        break;
        case 'Ввести номер автомата': 
          bot.sendMessage(msg.chat.id, phrases.enterVendorNum);
          break;
        case '💳 Рахунок':
          bot.sendMessage(msg.chat.id, phrases.accountStatus, {
            reply_markup: { keyboard: keyboards.accountStatus, resize_keyboard: true, one_time_keyboard: true }
          });
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
          Клієнт: ${apiData?.name}          
Тип картки: ${card.CardGroup}
💰 Поточний баланс:
${card.WaterQty/10} л.
✅ Бонусний профіль: ${card.Discount} %
До наступного бонусного профілю залишилося набрати: ${nextLevel(card.Discount, card.AllQty)} л.
🔄 Всього через картку налито: ${card.AllQty} л.
          `
          bot.sendMessage(msg.chat.id, balanceMessage, {
            reply_markup: { keyboard: keyboards.mainMenuButton, resize_keyboard: true, one_time_keyboard: true }
          });
          break;
        case '⭐️ Бонуси': 
          let userBonusAcc = phrases.userBonusAcc;
          bot.sendMessage(msg.chat.id, userBonusAcc, {
            reply_markup: { keyboard: keyboards.accountStatus, resize_keyboard: true, one_time_keyboard: true }
          });
        break;
        case '📊 Історія операцій':
          bot.sendMessage(msg.chat.id, phrases.userHistory, {
            reply_markup: { keyboard: keyboards.historyMenu, resize_keyboard: true, one_time_keyboard: true }
          });
        break;
      };


      switch (dialogueStatus) {
        case 'amountFromBalance':
          if(!isNaN(msg.text)) {
            const balanceAmount = balance - msg.text;
            if (balanceAmount >= 0) {
              bot.sendMessage(chatId, phrases.orderFromBalanceInstruction, { reply_markup:  { keyboard: keyboards.mainMenuButton, resize_keyboard: true, one_time_keyboard: false } });
              await updateUserByChatId(chatId, { goods: balanceAmount });
            } else {
              bot.sendMessage(chatId, phrases.lowBalance, { reply_markup:  { keyboard: keyboards.lowBalance, resize_keyboard: true, one_time_keyboard: false } });
              await updateUserByChatId(chatId, { dialoguestatus: 'vendorConfirmation' });
            }
          } else {
            bot.sendMessage(chatId, phrases.wrongNumber);
          }
        break;
/*
        case 'volume':          
          if(!isNaN(msg.text)) {
            const deviceData = JSON.parse(tempData);
            const deviceActivated = await activateDevice(deviceData.id, cardCard, cardNumber);
            const link = `https://easypay.ua/ua/partners/vodoleylviv-card?account=${cardNumber}&amount=${msg.text * 1.5}`;
            await bot.sendMessage(chatId, `Ви купуєте ${msg.text} л води в автоматі №${deviceData.id}.`, {
              reply_markup: { inline_keyboard: [[{
                  text: 'Оплатити',
                  url: link,
                }]] 
              } 
            });
            await bot.sendMessage(chatId, phrases.pressStart, { reply_markup:  { keyboard: keyboards.mainMenuButton, resize_keyboard: true, one_time_keyboard: false } });
            const apiUser = await findApiUserByChatId(chatId);
            checkBalanceChange(chatId, apiUser.user_id, cardCard);
                     
            //checkPayment(chatId, deviceData.id, apiData?.cards, cardNumber);
            
          } else {
            bot.sendMessage(chatId, phrases.wrongNumber);
          }
        break;
        case 'amount':
          if(!isNaN(msg.text)) {
            const deviceData = JSON.parse(tempData);
            const deviceActivated = await activateDevice(deviceData.id, cardCard, cardNumber);
            const link = `https://easypay.ua/ua/partners/vodoleylviv-card?account=${cardNumber}&amount=${msg.text}`;
            console.log(link);
            await bot.sendMessage(chatId, `Ви купуєте воду на ${msg.text} грн в автоматі №${deviceData.id}.`, {
              reply_markup: { inline_keyboard: [[{
                  text: 'Оплатити',
                  url: link,
                }]] 
              } 
            });
            await bot.sendMessage(chatId, phrases.pressStart, { reply_markup:  { keyboard: keyboards.mainMenuButton, resize_keyboard: true, one_time_keyboard: false } });

            if (userInfo) console.log(userInfo)
            
            const apiUser = await findApiUserByChatId(chatId);
            checkBalanceChange(chatId, apiUser.user_id, cardCard);
            //checkPayment(chatId, deviceData.id, apiData?.cards, cardNumber);

          } else {

            bot.sendMessage(chatId, phrases.wrongNumber);

          }
        break;
*/

        case 'verifyAddress':
          if (msg.location) {
            const locations = await axios.get('http://soliton.net.ua/water/api/devices');
            const targetCoordinate = {lat: msg.location.latitude, lon: msg.location.longitude};
            const nearest = findNearestCoordinate(locations.data.devices, targetCoordinate);
            //bot.sendMessage(chatId, `${msg.location.latitude} , ${msg.location.longitude}`);
            await updateUserByChatId(chatId, { dialoguestatus: 'verificationConfirmation', fathersname: JSON.stringify(nearest) });

    
            bot.sendLocation(chatId, nearest.lat, nearest.lon);
            bot.sendMessage(chatId, `Це автомат "${nearest.id}" "${nearest.name}"?`, {
              reply_markup: { keyboard: keyboards.binarKeys, resize_keyboard: true, one_time_keyboard: true }
            });
          }

          if (!isNaN(msg.text)) {
            const locations = await axios.get('http://soliton.net.ua/water/api/devices');
            const currentVendor = locations.data.devices.find(device => device.id == msg.text);
            if (!currentVendor) {
              //Що робити коли помилковий номер
            }
            await updateUserByChatId(chatId, { dialoguestatus: 'verificationConfirmation', fathersname: JSON.stringify(currentVendor) });

            bot.sendMessage(chatId, `Це автомат "${currentVendor.id}" "${currentVendor.name}"?`, {
              reply_markup: { keyboard: keyboards.binarKeys, resize_keyboard: true, one_time_keyboard: true }
            });  
          } else {
            if (!msg.location) bot.sendMessage(chatId, /*phrases.wrongNumber*/ `WRONG`);            
          }
        break;
      }

      if (msg.location) {
        const locations = await axios.get('http://soliton.net.ua/water/api/devices');
        const targetCoordinate = {lat: msg.location.latitude, lon: msg.location.longitude};
        const nearest = findNearestCoordinate(locations.data.devices, targetCoordinate);
        bot.sendMessage(chatId, `${nearest.name} `);

        bot.sendLocation(chatId, nearest.lat, nearest.lon);
      }

  });
};

