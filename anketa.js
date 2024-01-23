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
            await updateUserByChatId(chatId, { dialoguestatus: '' });
          
            bot.sendMessage(chatId, phrases.welcomeHaveCard, {
              reply_markup: { keyboard: keyboards.mainMenu, resize_keyboard: true, one_time_keyboard: true }
            });
       
          break;
        case '/mainHaveCard':
            await userLogin(chatId);
            await updateUserByChatId(chatId, { dialoguestatus: '' });
            bot.sendMessage(chatId, phrases.isBonusCardMessage, {
              reply_markup: { keyboard: keyboards.welcomeNoCard, resize_keyboard: true, one_time_keyboard: true }
            });
        break;  



        case  '/volume':
          await updateUserByChatId(chatId, { units: 'volume' })
          bot.sendMessage(chatId, phrases.chooseVolume, { reply_markup: keyboards.volumeKeyboard })
          break;
        case '/price':
          await updateUserByChatId(chatId, { units: 'price' })
          bot.sendMessage(chatId, phrases.chooseAmount, { reply_markup: keyboards.amountKeyboard });  
          break;
        case '/water':
          await updateUserByChatId(chatId, { goods: 'water' })
          bot.sendMessage(chatId, phrases.volumeOrPrice, { reply_markup: keyboards.volumeOrPrice })
          break;
        case '/richedwater':
          await updateUserByChatId(chatId, { goods: 'richedwater' })
          bot.sendMessage(chatId, phrases.volumeOrPrice, { reply_markup: keyboards.volumeOrPrice })
          break;
        case 'volume-1':
          logger.info(`USER_ID: ${chatId} used ${1} litr from the balance`);
          await updateUserByChatId(chatId, { goods: '', units: '' });
          bot.sendMessage(chatId, 'Операція успішна')
          break;
        case 'volume-5':
          logger.info(`USER_ID: ${chatId} used ${5} litr from the balance`);
          await updateUserByChatId(chatId, { goods: '', units: '' });
          bot.sendMessage(chatId, 'Операція успішна')
          break;
        case 'volume-6':
          logger.info(`USER_ID: ${chatId} used ${6} litr from the balance`);
          await updateUserByChatId(chatId, { goods: '', units: '' });
          bot.sendMessage(chatId, 'Операція успішна')
          break;

        case 'volume-10':
          logger.info(`USER_ID: ${chatId} used ${10} litr from the balance`);
          await updateUserByChatId(chatId, { goods: '', units: '' });
          bot.sendMessage(chatId, 'Операція успішна')
          break;

        case 'volume-12':
          logger.info(`USER_ID: ${chatId} used ${12} litr from the balance`);
          await updateUserByChatId(chatId, { goods: '', units: '' });
          bot.sendMessage(chatId, 'Операція успішна')
          break;

        case 'volume-19':
          logger.info(`USER_ID: ${chatId} used ${19} litr from the balance`);
          await updateUserByChatId(chatId, { goods: '', units: '' });
          bot.sendMessage(chatId, 'Операція успішна')
          break;


        case 'amount-2':
          logger.info(`USER_ID: ${chatId} used ${2} UAH from the balance`);
          await updateUserByChatId(chatId, { goods: '', units: '' });
          bot.sendMessage(chatId, 'Операція успішна')
          break;
        case 'amount-5':
          logger.info(`USER_ID: ${chatId} used ${5} UAH from the balance`);
          await updateUserByChatId(chatId, { goods: '', units: '' });
          bot.sendMessage(chatId, 'Операція успішна')
          break;
        case 'amount-10':
          logger.info(`USER_ID: ${chatId} used ${10} UAH from the balance`);
          await updateUserByChatId(chatId, { goods: '', units: '' });
          bot.sendMessage(chatId, 'Операція успішна')
          break;
        case 'amount-15':
          logger.info(`USER_ID: ${chatId} used ${15} UAH from the balance`);
          await updateUserByChatId(chatId, { goods: '', units: '' });
          bot.sendMessage(chatId, 'Операція успішна')
          break;
        case 'amount-20':
          logger.info(`USER_ID: ${chatId} used ${20} UAH from the balance`);
          await updateUserByChatId(chatId, { goods: '', units: '' });
          bot.sendMessage(chatId, 'Операція успішна')
          break;
        case 'amount-30':
          logger.info(`USER_ID: ${chatId} used ${30} UAH from the balance`);
          await updateUserByChatId(chatId, { goods: '', units: '' });
          bot.sendMessage(chatId, 'Операція успішна')
          break;
      }
    });
    
    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      
        const userInfo = await findUserByChatId(chatId);
        let dialogueStatus;
        let isAuthenticated;
        let birthDaydate;
        let tempData;
        let userDatafromApi;
        let balance;
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
          }
          else
          bot.sendMessage(msg.chat.id, 'Ви не авторизовані', {
            reply_markup: { keyboard: keyboards.login, resize_keyboard: true, one_time_keyboard: true }
          });
          
          break;

        
        case 'Готівкою':
          bot.sendMessage(chatId, phrases.vendorActivation, {
            reply_markup: { keyboard: keyboards.mainMenuButton, resize_keyboard: true, one_time_keyboard: true }
          });

          setTimeout(() => {
            bot.sendMessage(chatId, phrases.bonusNotification);
          }, 30000);
          
        break;

        case 'Картка Visa/Mastercard':
          bot.sendMessage(chatId, phrases.countType, {
            reply_markup: { keyboard: keyboards.countType, resize_keyboard: true, one_time_keyboard: true }
          }); 
        break;
        case 'Ввести суму в літрах':
          bot.sendMessage(chatId, phrases.litrRules, {
            reply_markup: { keyboard: keyboards.litrRules, resize_keyboard: true, one_time_keyboard: true }
          });
          await updateUserByChatId(chatId, { dialoguestatus: 'volume' }); 
        break;
        case 'Ввести суму в грн':
          bot.sendMessage(chatId, phrases.amountRules);
          await updateUserByChatId(chatId, { dialoguestatus: 'amount' }); 
        break;

        

        case 'Балансом картки Водолій':
          bot.sendMessage(chatId, phrases.amountFromBalance, {
            reply_markup: { keyboard: keyboards.litrRules, resize_keyboard: true, one_time_keyboard: true }
          });
          await updateUserByChatId(chatId, { dialoguestatus: 'amountFromBalance' }); 

        break;


        case '/login':
          if (isAuthenticated) {
            bot.sendMessage(msg.chat.id, phrases.alreadyAuth, {
              reply_markup: { keyboard: keyboards.mainMenu, resize_keyboard: true, one_time_keyboard: true }
            });  
          }
          else
          bot.sendMessage(msg.chat.id,  {
            reply_markup: { keyboard: keyboards.login, resize_keyboard: true, one_time_keyboard: true }
          });
          break;
        case 'Ввести номер автомата': 
          bot.sendMessage(msg.chat.id, phrases.selectGoods, {
            reply_markup: keyboards.twoWaters
          });
          break;
        case 'Відсканувати QR-код':
          bot.sendMessage(msg.chat.id, 'Очікую фото', {
            reply_markup: { keyboard: keyboards.chooseVendor, resize_keyboard: true, one_time_keyboard: true }
          });
          break;
        case 'Акції і новини':
          const news = await axios.get('http://soliton.net.ua/water/api/news');
          news.data.news.forEach(element => {
            bot.sendMessage(msg.chat.id, `
            ${element.date}

            ${element.title}

            ${element.desc}
            ` );  
          });
          console.log(news.data);
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
          /* Оновлювати актуальну інформацію
          const userCard = await axios.get(`http://soliton.net.ua/water/api/user/index.php?phone=${userInfo.phone}`);
          await updateUserByChatId(chatId, { lastname: JSON.stringify(userCard.data.user) }); 
          */
          let currentTime = DateTime.now().toFormat('yy-MM-dd HH:mm:ss');

          console.log(userDatafromApi.card[0]);

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

          console.log(userDatafromApi);

          const balanceMessage = `
            ${userDatafromApi.name}
          ${currentTime}
          Тип карти: ${userDatafromApi.card[0].CardGroup}

          💰 Поточний баланс:
          
          ${userDatafromApi.card[0].WaterQty} БОНУСНИХ грн.

          🔄 Оборот коштів:
          ${userDatafromApi.card[0].AllQty} БОНУСНИХ грн.

          Знижка: ${userDatafromApi.card[0].Discount}%
          `
          bot.sendMessage(msg.chat.id, balanceMessage, /*{
            reply_markup: { keyboard: keyboards.accountStatus, resize_keyboard: true, one_time_keyboard: true }
          }*/);
          break;
        case '💸 Поповнити картку':
          bot.sendMessage(msg.chat.id, phrases.enterTopupAmount, {
            reply_markup: { keyboard: keyboards.returnToBalance, resize_keyboard: true, one_time_keyboard: true }
          });
          await updateUserByChatId(chatId, { dialoguestatus: 'topup' });
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
            const userCard = await axios.get(`http://soliton.net.ua/water/api/user/index.php?phone=${userInfo.phone}`);
            await updateUserByChatId(chatId, { lastname: JSON.stringify(userCard.data.user) });
            console.log(newUser.data);
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
        case 'topup':
            await updateUserByChatId(chatId, { dialoguestatus: '' });
            await bot.sendMessage(chatId, `Ви поповнюєте рахунок на ${msg.text} грн.`, {
                reply_markup: { inline_keyboard: [[{
                    text: 'Перейти до оплати',
                    url: `https://easypay.ua/ua/partners/vodoleylviv-card?amount=${msg.text}`,
                }]] }
            });
            break;

        case 'buyWater':
            await updateUserByChatId(chatId, { dialoguestatus: 'vendorConfirmation', fathersname: msg.text });
            bot.sendMessage(chatId, `Це автомат "${msg.text}" "${msg.text}"?`, {
              reply_markup: { keyboard: keyboards.binarKeys, resize_keyboard: true, one_time_keyboard: true }
            });
            break;

        case 'vendorConfirmation': 
            if (msg.text === 'Так' || msg.text === 'Вибрати інший спосіб оплати') {
              bot.sendMessage(msg.chat.id, `Покупка води на автоматі "${tempData}" за адресою "${tempData}". Оберіть спосіб оплати`, {
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
      }

      if (msg.location) {
        logger.info(`USER_ID: ${chatId} share location`);
        const locations = await axios.get('http://soliton.net.ua/water/api/devices');
        const targetCoordinate = {lat: msg.location.latitude, lon: msg.location.longitude};
        console.log(locations.data.devices);
        const nearest = findNearestCoordinate(locations.data.devices, targetCoordinate);
        //bot.sendMessage(chatId, `${msg.location.latitude} , ${msg.location.longitude}`);

        bot.sendMessage(chatId, `${nearest.name}`);

        bot.sendLocation(chatId, nearest.lat, nearest.lon);
      }

  });
};