import { bot } from "./app.js";
import { phrases, keyboards } from './language_ua.js';
import { logger } from './logger/index.js';
import { DateTime } from "luxon";
import { 
  updateUserByChatId,
  userLogin,
  userLogout,
  findUserByChatId,
  createNewUserByChatId
} from './models/users.js';
//import { generateKeyboard } from './src/plugins.mjs';
import axios from 'axios';
import { findNearestCoordinate } from './modules/locations.js';
import { numberFormatFixing } from './modules/validations.js';

export const anketaListiner = async() => {
  
    bot.on("callback_query", async (query) => {

      const action = query.data;
      const chatId = query.message.chat.id;
      
      switch (action) {
        case '/mainNoCard':
            await userLogin(chatId);
            await updateUserByChatId(chatId, { dialoguestatus: '',  units: chatId, lastname: JSON.stringify({
              CardGroup: 'Demo',
              WaterQty: 356,
              AllQty: 1245,
              Discount: 90,
            })});          
            bot.sendMessage(chatId, phrases.welcomeNoCard, {
              reply_markup: { keyboard: keyboards.mainMenu, resize_keyboard: true, one_time_keyboard: true }
            });       
          break;
        case '/mainHaveCard':
            await userLogin(chatId);
            await updateUserByChatId(chatId, { dialoguestatus: '', units: chatId, lastname: JSON.stringify({
              CardGroup: 'Demo',
              WaterQty: 356,
              AllQty: 1245,
              Discount: 90,
            })});
            bot.sendMessage(chatId, phrases.welcomeHaveCard, {
              reply_markup: { keyboard: keyboards.mainMenuWithVerify, resize_keyboard: true, one_time_keyboard: true }
            });
        break;  
      }
    });
    
    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      
        const userInfo = await findUserByChatId(chatId);

        let dialogueStatus, isAuthenticated, birthDaydate, tempData, userDatafromApi, balance, cardNumber, firstname;

        if (userInfo) {
          dialogueStatus = userInfo.dialoguestatus;
          isAuthenticated = userInfo.isAuthenticated;
          birthDaydate = userInfo.birthdaydate;

          if (userInfo.hasOwnProperty("lastname")) {
            const data = JSON.parse(userInfo.lastname);
            userDatafromApi = data;
          }
          if (userInfo.hasOwnProperty("fathersname")) {
            tempData = userInfo.fathersname;
          }
          if (userInfo.hasOwnProperty("goods")) {
            balance = userInfo.goods;
          }
          if (userInfo.hasOwnProperty("units")) {
            cardNumber = userInfo.units;
          }
          if (userInfo.hasOwnProperty("firstname")) {
            firstname = userInfo.firstname;
          }
          
        }
  
      switch (msg.text) {
        
        case '/start':
          if(userInfo) await updateUserByChatId(chatId, { dialoguestatus: '' });
          if (isAuthenticated) 
            bot.sendMessage(msg.chat.id, phrases.mainMenu, {
              reply_markup: { keyboard: keyboards.mainMenu, resize_keyboard: true, one_time_keyboard: true }
            });
          else {
            logger.info(`USER_ID: ${chatId} join BOT`);
            await createNewUserByChatId(chatId);
            await updateUserByChatId(chatId, { dialoguestatus: 'phoneNumber' });
            bot.sendMessage(msg.chat.id, phrases.greetings, {
              reply_markup: { keyboard: keyboards.contactRequest, resize_keyboard: true, one_time_keyboard: true }
            });  

          }
        break;


        case 'Повернутися до головного меню':
        case 'До головного меню':
          await updateUserByChatId(chatId, { dialoguestatus: '' });
          if (isAuthenticated) {
            bot.sendMessage(msg.chat.id, phrases.mainMenu, {
              reply_markup: { keyboard: keyboards.mainMenu, resize_keyboard: true, one_time_keyboard: true }
            });  
            return;
          } else {
            bot.sendMessage(msg.chat.id, 'Ви не авторизовані', {
              reply_markup: { keyboard: keyboards.login, resize_keyboard: true, one_time_keyboard: true }
            });  
          }
        break;

        
        case 'Готівкою':
          if (dialogueStatus === 'cardBalanceRefil') {

          } else {
            bot.sendMessage(chatId, phrases.vendorActivation, {
              reply_markup: { keyboard: keyboards.mainMenuButton, resize_keyboard: true, one_time_keyboard: true }
            });
  
            setTimeout(() => {
              bot.sendMessage(chatId, phrases.bonusNotification);
            }, 30000);
  
          }
          
        break;

        case 'Картка Visa/Mastercard':
          if (dialogueStatus === 'cardBalanceRefil') {

          } else {
          bot.sendMessage(chatId, phrases.countType, {
            reply_markup: { keyboard: keyboards.countType, resize_keyboard: true, one_time_keyboard: true }
          }); 
          }
        break;
        case 'Ввести суму в літрах':
          if (dialogueStatus === 'cardBalanceRefil') {
            bot.sendMessage(chatId, phrases.litrRules, {
              reply_markup: { keyboard: keyboards.litrRules, resize_keyboard: true, one_time_keyboard: true }
            });
            await updateUserByChatId(chatId, { dialoguestatus: 'volumeLink' });   
          } else {          
          bot.sendMessage(chatId, phrases.litrRules, {
            reply_markup: { keyboard: keyboards.litrRules, resize_keyboard: true, one_time_keyboard: true }
          });
          await updateUserByChatId(chatId, { dialoguestatus: 'volume' }); 
          }
        break;
        case 'Ввести суму в грн':
          if (dialogueStatus === 'cardBalanceRefil') {
            bot.sendMessage(chatId, phrases.litrRules);
            await updateUserByChatId(chatId, { dialoguestatus: 'amountLink' });   
          } else {

          bot.sendMessage(chatId, phrases.amountRules);
          await updateUserByChatId(chatId, { dialoguestatus: 'amount' }); 
          }
        break;

        

        case 'Балансом картки Водолій':
          bot.sendMessage(chatId, phrases.amountFromBalance, {
            reply_markup: { keyboard: keyboards.litrRules, resize_keyboard: true, one_time_keyboard: true }
          });
          await updateUserByChatId(chatId, { dialoguestatus: 'amountFromBalance' }); 

        break;

        case 'Ввести номер автомата': 
          bot.sendMessage(msg.chat.id, phrases.selectGoods, {
            reply_markup: keyboards.twoWaters
          });
        break;

        case '/logout':
        case 'Вийти з акаунту':
          try {
            await userLogout(chatId);
            logger.info(`USER_ID: ${chatId} logged out`);
            bot.sendMessage(chatId, phrases.logout, {
              reply_markup: { keyboard: keyboards.login, resize_keyboard: true },
            });  
          } catch (error) {
            logger.warn(`Can't loggout`)
          }
          break;
        case 'Авторизуватись':
          if(userInfo) {
            await updateUserByChatId(chatId, { dialoguestatus: 'numberlogin' });
            await bot.sendMessage(msg.chat.id, phrases.contactRequest, {
              reply_markup: { keyboard: keyboards.contactRequest, resize_keyboard: true, one_time_keyboard: true }
            });
             
          } else {
            await bot.sendMessage(msg.chat.id, phrases.registerRequest, {
              reply_markup: { keyboard: keyboards.login, resize_keyboard: true, one_time_keyboard: true }
            });
          };
          break;  
        case 'Зареєструватись':
        case '/register':
          if(userInfo) {
            bot.sendMessage(chatId, `Ви вже зареєстровані, будь ласка, авторизуйтесь`,{
              reply_markup: { keyboard: keyboards.login, resize_keyboard: true, one_time_keyboard: true }
            });
          } else {
            
            await createNewUserByChatId(chatId);
            bot.sendMessage(msg.chat.id, phrases.contactRequest, {
              reply_markup: { keyboard: keyboards.contactRequest, resize_keyboard: true, one_time_keyboard: true }
            });  
          }
          break;
        case 'Відсканувати QR-код': 
          bot.sendMessage(msg.chat.id, phrases.photoRequest, {
            reply_markup: { keyboard: keyboards.contactRequest, resize_keyboard: true, one_time_keyboard: true }
          });
          break;
        case 'Ні, я введу номер вручну':
          bot.sendMessage(msg.chat.id, phrases.phoneRules);
          break;



        case '⛽️ Купити воду': 
          await bot.sendMessage(chatId, phrases.chooseVendor, {
            reply_markup: { keyboard: keyboards.chooseVendor, resize_keyboard: true, one_time_keyboard: true }
          });
          await updateUserByChatId(chatId, { dialoguestatus: 'buyWater' });
          break;


        case 'Ввести номер автомата': 
          bot.sendMessage(msg.chat.id, phrases.enterVendorNum);
          break;
        case '💳 Рахунок':
          bot.sendMessage(msg.chat.id, phrases.accountStatus, {
            reply_markup: { keyboard: keyboards.accountStatus, resize_keyboard: true, one_time_keyboard: true }
          });
          break;
        case 'Мій профіль':
          
          //const userCard = await axios.get(`http://soliton.net.ua/water/api/user/index.php?phone=${userInfo.phone}`);
          //await updateUserByChatId(chatId, { lastname: JSON.stringify(userCard.data.user) }); 
          
          let currentTime = DateTime.now().toFormat('yy-MM-dd HH:mm:ss');

          //console.log(userDatafromApi.card[0]);
/*
          if (!userDatafromApi.card[0]) {
            const cardData = 
              {
                CardGroup: 'Demo',
                WaterQty: 356,
                AllQty: 1245,
                Discount: 90,
              }
            
            userDatafromApi.card.push(cardData);
          }
*/
          console.log(userDatafromApi);
          
          const balanceMessage = `
            ${firstname}
          ${currentTime}
          Тип карти: ${userDatafromApi.CardGroup}

          💰 Поточний баланс:
          
          ${userDatafromApi.WaterQty} БОНУСНИХ грн.

          🔄 Оборот коштів:
          ${userDatafromApi.AllQty} БОНУСНИХ грн.

          Знижка: ${userDatafromApi.Discount}%
          `
          bot.sendMessage(msg.chat.id, balanceMessage, {
            reply_markup: { keyboard: keyboards.mainMenuButton, resize_keyboard: true, one_time_keyboard: true }
          });
          break;
        case '💸 Поповнити картку':
          bot.sendMessage(msg.chat.id, phrases.choosePaymantWay, {
            reply_markup: { keyboard: keyboards.choosePaymantWay, resize_keyboard: true, one_time_keyboard: true }
          });
          await updateUserByChatId(chatId, { dialoguestatus: 'cardBalanceRefil' });
          break;
        case '⭐️ Бонуси': 
          let userBonusAcc = phrases.userBonusAcc;
          bot.sendMessage(msg.chat.id, userBonusAcc, {
            reply_markup: { keyboard: keyboards.accountStatus, resize_keyboard: true, one_time_keyboard: true }
          });
        break;
        case 'Служба підтримки': 
          bot.sendMessage(msg.chat.id, 'Номер телефону, за яким надаємо допомогу клієнтам: 0964587425');
        break;
        case '📊 Історія операцій':
          bot.sendMessage(msg.chat.id, phrases.userHistory, {
            reply_markup: { keyboard: keyboards.historyMenu, resize_keyboard: true, one_time_keyboard: true }
          });
        break;


        case 'Верифікувати картку':
          bot.sendMessage(msg.chat.id, phrases.verifyRules, {
            reply_markup: { keyboard: keyboards.verifyRules, resize_keyboard: true, one_time_keyboard: true }
          });  
          
        case 'Ні':
          if (dialogueStatus === 'verificationConfirmation') {
            bot.sendMessage(msg.chat.id, phrases.verifyRules, {
              reply_markup: { keyboard: keyboards.verifyRules, resize_keyboard: true, one_time_keyboard: true }
            });  
          }
        break;

        case 'Продовжити верифікацію':
          await updateUserByChatId(chatId, { dialoguestatus: 'verifyAddress' });
          bot.sendMessage(msg.chat.id, phrases.chooseVendor, {
            reply_markup: { keyboard: keyboards.chooseVendor, resize_keyboard: true, one_time_keyboard: true }
          });
        break;
        case 'Картку зчитано':
          const number = await updateUserByChatId(chatId, { units: '002288' });
          if (number) {
            bot.sendMessage(msg.chat.id, phrases.successVerify, {
              reply_markup: { keyboard: keyboards.mainMenuButton, resize_keyboard: true, one_time_keyboard: true }
            });
  
          } else {
            bot.sendMessage(msg.chat.id, phrases.failVerify, {
              reply_markup: { keyboard: keyboards.failVerify, resize_keyboard: true, one_time_keyboard: true }
            });
  
          }


        break;
      };


      switch (dialogueStatus) {

        case 'phoneNumber':
          if (msg.contact) {
            console.log('contact')
            const phone = numberFormatFixing(msg.contact.phone_number);
            try {
              await updateUserByChatId(chatId, { phone, dialoguestatus: 'name' });
              await bot.sendMessage(chatId, phrases.nameRequest);
            } catch (error) {
              logger.warn(`Cann't update phone number`);
            }
          } else if (msg.text) {
            if (msg.text.length === 9 && !isNaN(parseFloat(msg.text))) {
              console.log('phone')

              const phone = numberFormatFixing(msg.text);
              try {
                await updateUserByChatId(chatId, { phone, dialoguestatus: 'name' });
                await bot.sendMessage(chatId, phrases.nameRequest);
              } catch (error) {
                logger.warn(`Cann't update phone number`);
              }  
            } else {
              await bot.sendMessage(chatId, phrases.wrongPhone);
            }
          }  
    
        break;

        case 'name': 
            await updateUserByChatId(chatId, { firstname: msg.text, dialoguestatus: 'birthdaydate' });
            await bot.sendMessage(chatId, `Введіть дату народження у форматі ДД.ММ.РРРР`);

        break;

        case 'birthdaydate':
          if (msg.text.length === 10) {
            await updateUserByChatId(chatId, { birthdaydate: msg.text, dialoguestatus: '' });
  
            console.log(userInfo.phone);
            console.log(userInfo.firstname);
            console.log(msg.text);
            const newUser = await axios.post('http://soliton.net.ua/water/api/user/add/index.php', {
                phone_number: userInfo.phone,
                name: userInfo.firstname,
                date_birth: msg.text,
                email: 'brys@gmail.com'
            });
            console.log(newUser.data);

            const userCard = await axios.get(`http://soliton.net.ua/water/api/user/index.php?phone=${userInfo.phone}`);
            await updateUserByChatId(chatId, { lastname: JSON.stringify(userCard.data.user) });
            if (newUser.data.status) {
                logger.info(`USER_ID: ${chatId} registered`);
                bot.sendMessage(chatId, phrases.bonusCardQuestion, {
                    reply_markup: keyboards.isBonusCard
                }, {
                    reply_markup: { keyboard: keyboards.mainMenu, resize_keyboard: true, one_time_keyboard: true }
                });
            }  
          } else {
            await bot.sendMessage(chatId, phrases.wrongBirthDate);
          }
        break;

        case 'buyWater':
            console.log(msg.text)
            if (msg.location) {
              logger.info(`USER_ID: ${chatId} share location`);
              const locations = await axios.get('http://soliton.net.ua/water/api/devices');
              const targetCoordinate = {lat: msg.location.latitude, lon: msg.location.longitude};
              console.log(locations.data.devices);
              const nearest = findNearestCoordinate(locations.data.devices, targetCoordinate);
              //bot.sendMessage(chatId, `${msg.location.latitude} , ${msg.location.longitude}`);
              await updateUserByChatId(chatId, { dialoguestatus: 'vendorConfirmation', fathersname: JSON.stringify(nearest) });
  
      
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
              await updateUserByChatId(chatId, { dialoguestatus: 'vendorConfirmation', fathersname: JSON.stringify(currentVendor) });
  
              bot.sendMessage(chatId, `Це автомат "${currentVendor.id}" "${currentVendor.name}"?`, {
                reply_markup: { keyboard: keyboards.binarKeys, resize_keyboard: true, one_time_keyboard: true }
              });  
            } else {
              bot.sendMessage(chatId, phrases.wrongNumber);
            }
        break;

        case 'vendorConfirmation': 
            const deviceData = JSON.parse(tempData)

            if (msg.text === 'Так' || msg.text === 'Вибрати інший спосіб оплати') {
              bot.sendMessage(msg.chat.id, `Покупка води на автоматі "${deviceData.name}" за адресою "${deviceData.id}". Оберіть спосіб оплати`, {
                reply_markup: { keyboard: keyboards.paymantMethod, resize_keyboard: true, one_time_keyboard: true }
              });
              await updateUserByChatId(chatId, { dialoguestatus: '' });
              //тут починається шлях поповнення
            } else {
              bot.sendMessage(chatId, phrases.chooseVendor, {
                reply_markup: { keyboard: keyboards.chooseVendor, resize_keyboard: true, one_time_keyboard: true }
              });
              await updateUserByChatId(chatId, { dialoguestatus: 'buyWater' });
            }
        break;

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

        case 'volume':          
          if(!isNaN(msg.text)) {
            const link = `https://easypay.ua/ua/partners/vodoleylviv?account=${tempData}&amount=${msg.text}`;
            await bot.sendMessage(chatId, `Ви купуєте ${msg.text} л води в автоматі №${tempData}.`, {
              reply_markup: { inline_keyboard: [[{
                  text: 'Оплатити',
                  url: link,
                }]] 
              } 
            });
            await bot.sendMessage(chatId, phrases.pressStart, { reply_markup:  { keyboard: keyboards.mainMenuButton, resize_keyboard: true, one_time_keyboard: false } });
            setTimeout(() => {
              bot.sendMessage(chatId, phrases.bonusNotification);
            }, 30000);
          } else {
            bot.sendMessage(chatId, phrases.wrongNumber);
          }
        break;
        case 'amount':
          if(!isNaN(msg.text)) {
            const link = `https://easypay.ua/ua/partners/vodoleylviv?account=${tempData}&amount=${msg.text}`;
            await bot.sendMessage(chatId, `Ви купуєте воду на ${msg.text} грн в автоматі №${tempData}.`, {
              reply_markup: { inline_keyboard: [[{
                  text: 'Оплатити',
                  url: link,
                }]] 
              } 
            });
            await bot.sendMessage(chatId, phrases.pressStart, { reply_markup:  { keyboard: keyboards.mainMenuButton, resize_keyboard: true, one_time_keyboard: false } });
            setTimeout(() => {
              bot.sendMessage(chatId, phrases.bonusNotification);
            }, 30000);
          } else {
            bot.sendMessage(chatId, phrases.wrongNumber);
          }
        break;


        case 'verifyAddress':
          if (msg.location) {
            logger.info(`USER_ID: ${chatId} share location`);
            const locations = await axios.get('http://soliton.net.ua/water/api/devices');
            const targetCoordinate = {lat: msg.location.latitude, lon: msg.location.longitude};
            console.log(locations.data.devices);
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
            bot.sendMessage(chatId, phrases.wrongNumber);
          }
        break;
        case 'verificationConfirmation':
          if (msg.text === 'Так') {
            bot.sendMessage(chatId, phrases.readCard, { reply_markup:  { keyboard: keyboards.readCard, resize_keyboard: true, one_time_keyboard: false } });
          } else {

          }
        break;


        case 'cardBalanceRefil':
          if (msg.text === 'Готівка') {
            bot.sendMessage(chatId, phrases.chooseVendorRefil, { reply_markup:  { keyboard: keyboards.chooseVendor, resize_keyboard: true, one_time_keyboard: false}});

          }
          if (msg.text === 'Картка Visa/Mastercard') {
            bot.sendMessage(chatId, phrases.cardRefilCard(cardNumber), { reply_markup:  { keyboard: keyboards.countType, resize_keyboard: true, one_time_keyboard: false}});

          }
          if(!isNaN(msg.text)) {
          await updateUserByChatId(chatId, { fathersname: msg.text });
          bot.sendMessage(chatId, `Це автомат "${msg.text}" "${msg.text}"?`, {
            reply_markup: { keyboard: keyboards.binarKeys, resize_keyboard: true, one_time_keyboard: true }
          });
          }
          if (msg.text === 'Так') {
            bot.sendMessage(chatId, phrases.readCardRefil, { reply_markup:  { keyboard: keyboards.readCardRefil, resize_keyboard: true, one_time_keyboard: false } });
          }
          if (msg.text === 'Ні') {
            bot.sendMessage(msg.chat.id, phrases.choosePaymantWay, {
              reply_markup: { keyboard: keyboards.choosePaymantWay, resize_keyboard: true, one_time_keyboard: true }
            });
          }
          if (msg.text === `на екрані автомату з'явився напис: "на балансі картки х літрів"`) {
            bot.sendMessage(msg.chat.id, phrases.cashRequest, {
              reply_markup: { keyboard: keyboards.mainMenuButton, resize_keyboard: true, one_time_keyboard: true }
            });
            setTimeout(() => {
              bot.sendMessage(chatId, phrases.bonusNotificationCard);
            }, 30000);
          }
          if (msg.text === `Пройшло понад 30 секунд, але напис на екрані автомату так і не з'явився`) {
            bot.sendMessage(msg.chat.id, phrases.choosePaymantWay, {
              reply_markup: { keyboard: keyboards.choosePaymantWay, resize_keyboard: true, one_time_keyboard: true }
            });
          }


        break;
        case 'volumeLink':
          if(!isNaN(msg.text)) {
            const amount = Math.round(msg.text * 1.5);
            const link = `https://easypay.ua/ua/partners/vodoleylviv-card=${cardNumber}?amount=${amount}`;
            await bot.sendMessage(chatId, `Поповнення картки номер "${cardNumber}".`, {
              reply_markup: { inline_keyboard: [[{
                  text: 'Оплатити',
                  url: link,
                }]] 
              } 
            });
            await bot.sendMessage(chatId, phrases.refilInfo, { reply_markup:  { keyboard: keyboards.mainMenuButton, resize_keyboard: true, one_time_keyboard: false } });
            setTimeout(() => {
              bot.sendMessage(chatId, phrases.bonusNotificationCard);
            }, 30000);
          } else {
            bot.sendMessage(chatId, phrases.wrongNumber);
          }
        break;
        case 'amountLink':
          if(!isNaN(msg.text)) {
            const link = `https://easypay.ua/ua/partners/vodoleylviv-card=${cardNumber}?amount=${msg.text}`;
            await bot.sendMessage(chatId, `Поповнення картки номер "${cardNumber}".`, {
              reply_markup: { inline_keyboard: [[{
                  text: 'Оплатити',
                  url: link,
                }]] 
              } 
            });
            await bot.sendMessage(chatId, phrases.refilInfo, { reply_markup:  { keyboard: keyboards.mainMenuButton, resize_keyboard: true, one_time_keyboard: false } });
            setTimeout(() => {
              bot.sendMessage(chatId, phrases.bonusNotificationCard);
            }, 30000);
          } else {
            bot.sendMessage(chatId, phrases.wrongNumber);
          }
        break;
      }
/*
      if (msg.location) {
        logger.info(`USER_ID: ${chatId} share location`);
        const locations = await axios.get('http://soliton.net.ua/water/api/devices');
        const targetCoordinate = {lat: msg.location.latitude, lon: msg.location.longitude};
        console.log(locations.data.devices);
        const nearest = findNearestCoordinate(locations.data.devices, targetCoordinate);

        bot.sendMessage(chatId, `${nearest.name} LOLOLC`);

        bot.sendLocation(chatId, nearest.lat, nearest.lon);
      }
*/
  });
};