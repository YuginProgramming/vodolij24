import { bot } from "../app.js";
import { keyboards, phrases } from "../language_ua.js";
import { createNewAchievement } from "../models/user_achievements.js";
import { createNewUserByChatId, findUserByChatId, updateUserByChatId } from "../models/users.js";


const mainMenu = async () => {
    bot.setMyCommands(
        [
            { command: '/start', description: 'Запустити бота' },
          ]
    );
    bot.on("callback_query", async (msg) => {

        const chatId = msg.message.chat.id;

        const callback_data = msg.data;

        if (callback_data === 'get_phone') {

            bot.sendMessage(chatId, 'Ось наш номер: +380975148884');

        };

    })

    bot.on("sticker", async (sticker) => {
        const stickerID = sticker.sticker.file_id;
        createNewAchievement(429789892, 1);
        console.log(stickerID)
    })

    bot.on('message', async (msg) => {

        const chatId = msg.chat.id; 
          
        const userInfo = await findUserByChatId(chatId);

        console.log(userInfo)
  
        let isAuthenticated;

        if (userInfo) isAuthenticated = userInfo.isAuthenticated;

        switch (msg.text) {
            
            case '/start':

                if (userInfo) await updateUserByChatId(chatId, { dialoguestatus: '' });

                if (isAuthenticated) {
                    
                    bot.sendMessage(msg.chat.id, phrases.mainMenu, {
                        reply_markup: { keyboard: keyboards.mainMenu, resize_keyboard: true, one_time_keyboard: true }
                    });

                } else {
                    
                    if (!userInfo) await createNewUserByChatId(chatId);
                    
                    await updateUserByChatId(chatId, { dialoguestatus: 'phoneNumber' });

                    bot.sendMessage(msg.chat.id, phrases.greetings, {
                      reply_markup: { keyboard: keyboards.contactRequest, resize_keyboard: true, one_time_keyboard: true }
                    });  
        
                }                
               
            break;
     
            case '🏠 Повернутися до головного меню':                
            case 'До головного меню':

                await updateUserByChatId(chatId, { dialoguestatus: '' });

                if (isAuthenticated) {
                    bot.sendSticker(chatId, 'CAACAgIAAxkBAAIDKmcXrxAqFyMHGYtAw0ZUuDJpjMb-AAKmAANSiZEja7kqEI23x7w2BA');

                    bot.sendMessage(chatId, phrases.mainMenu, {
                        reply_markup: { keyboard: keyboards.mainMenu, resize_keyboard: true, one_time_keyboard: false }
                    });  
                    return;

                } else {
                    bot.sendMessage(chatId, 'Ви не авторизовані', {
                        reply_markup: { keyboard: keyboards.login, resize_keyboard: true, one_time_keyboard: true }
                    });  
                }
            break;
/*
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
            */
            case '💬 Служба підтримки':

                bot.sendSticker(chatId, 'CAACAgIAAxkBAAIDQGcXsA9C246bIHxqWBMR0VzdEvCcAAK0AANSiZEjLSU_B-Skc_o2BA');

                bot.sendMessage(chatId, 'Шановні клієнти, служба підтримки працює за графіком: Пн-Пт з 8:00 до 22:00, Сб-Нд з 9:00 до 20:00', {
                    reply_markup: {
                        inline_keyboard: [
                        [{ text: '☎️ Подзвонити', callback_data: 'get_phone' }],
                        [{ text: '📝 Написати в Телеграм', url: 'https://t.me/vodolij_support' }]
                        ]
                    }
                });
            break;

        };

    });

};

export default mainMenu;