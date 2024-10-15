import { bot } from "../app.js";
import { keyboards, phrases } from "../language_ua.js";
import { logger } from "../logger/index.js";
import { createNewUserByChatId, findUserByChatId, updateUserByChatId } from "../models/users.js";


const mainMenu = async () => {

    bot.on('message', async (msg) => {

        const chatId = msg.chat.id; 
          
        const userInfo = await findUserByChatId(chatId);

        console.log(userInfo)
  
        let isAuthenticated;

        if (userInfo) isAuthenticated = userInfo.isAuthenticated;

        switch (msg.text) {
            
            case '/start':

                if(userInfo) await updateUserByChatId(chatId, { dialoguestatus: '' });

                if (isAuthenticated) {
                    
                    bot.sendMessage(msg.chat.id, phrases.mainMenu, {
                        reply_markup: { keyboard: keyboards.mainMenu, resize_keyboard: true, one_time_keyboard: true }
                    });

                } else {

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
            
            case 'Служба підтримки': 
                bot.sendMessage(msg.chat.id, 'Шановні клієнти, служба підтримки працює за графіком: Пн-Пт з 8:00 до 22:00, Сб-Нд з 9:00 до 20:00', {
                    reply_markup: {
                        inline_keyboard: [
                        [{ text: 'Подзвонити', callback_data: 'call_support' }],
                        [{ text: 'Написати в Телеграм', url: 'https://t.me/GamerX86' }]
                        ]
                    }
                });
            break;

        };

    });

};

export default mainMenu;