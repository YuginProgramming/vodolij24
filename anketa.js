import { bot } from "./app.js";
import { phrases, keyboards } from './language_ua.js';
import { 
  updateUserByChatId,
  findUserByChatId,
} from './models/users.js';
import axios from 'axios';
import { findNearestCoordinate } from './modules/locations.js';
import { findApiUserByChatId } from './models/api-users.js';
import { findCardById, updateCardById } from "./models/cards.js";
import { getCardData } from './modules/checkcardAPI.js';
import createCardApi from "./modules/createCard.js";
import { dataBot } from "./values.js";

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

      if (msg.text) {
        
        const command = msg.text.split('%');

        if (command && command[0] === 'linkCard') {
  
          await createCardApi(command[1], command[2]);
  
        }
      }

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

        const origin = msg.location.latitude + ',' + msg.location.longitude;

        const destination = nearest.lat + ',' + nearest.lon;

                // 🚶‍♂️ Пішки
        const walkingResponse = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
          params: {
            origin,
            destination,
            mode: 'walking',
            key: apiKey
          }
        });

        // 🚗 Авто
        const drivingResponse = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
          params: {
            origin,
            destination,
            mode: 'driving',
            key: apiKey
          }
        });

        const walkingRoute = walkingResponse.data.routes[0].legs[0];
        const drivingRoute = drivingResponse.data.routes[0].legs[0];

        const walkingDistance = walkingRoute.distance.text;     // напр. "4.2 km"
        const walkingDuration = walkingRoute.duration.text;     // напр. "52 mins"

        const drivingDistance = drivingRoute.distance.text;     // напр. "5.1 km"
        const drivingDuration = drivingRoute.duration.text;     // напр. "12 mins"

        const walkingLink = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
        const drivingLink = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

        const message = `🚶‍♂️ <a href="${walkingLink}">Відправитись пішки</a>: ${walkingDistance} ${walkingDuration}
🚗 <a href="${drivingLink}">Відправитись на авто</a>: ${drivingDistance} ${drivingDuration}`;

        await bot.sendMessage(chatId, message, {
          parse_mode: 'HTML',
          disable_web_page_preview: true
        });


      }

  });
};

