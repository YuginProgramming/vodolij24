import { bot } from "../app.js";
import { phrases } from "../language_ua.js";
import { logger } from "../logger/index.js";
import { createNewApiUser, findApiUserByChatId, updateApiUserByChatId } from "../models/api-users.js";
import { findUserByChatId, updateUserByChatId } from "../models/users.js";
import createCardApi from "../modules/createCard.js";


const numberFormatFixing = (phone) => {

    if (phone.length == 12) {
        return phone;
    } else if (phone.length == 13) {
        const fixedNumber = phone.slice(1);
        return fixedNumber;
    } else if (phone.length == 10) {
        const fixedNumber = '38' + phone;
        return fixedNumber;
    } else if (phone.length == 9) {
        const fixedNumber = '380' + phone;
        return fixedNumber;
    } else if (phone.length == 11) {
        const fixedNumber = '3' + phone;
        return fixedNumber;
    }

}

const introduction = async () => {

    bot.on('message', async (msg) => {

        const chatId = msg.chat.id; 
        
        const userInfo = await findUserByChatId(chatId);
  
        let dialogueStatus , birthDaydate, firstname;

        if (userInfo) {

            dialogueStatus = userInfo.dialoguestatus;
            birthDaydate = userInfo.birthdaydate;
  
            if (userInfo.hasOwnProperty("firstname")) {
              firstname = userInfo.firstname;
            }
            
        }

        if (msg.text === 'Ні, я введу номер вручну') bot.sendMessage(msg.chat.id, phrases.phoneRules);

        switch (dialogueStatus) {

            case 'phoneNumber':
                if (msg.contact) {

                    const phone = numberFormatFixing(msg.contact.phone_number);

                    try {
                        await updateUserByChatId(chatId, { phone, dialoguestatus: 'name' });
                        await bot.sendMessage(chatId, phrases.nameRequest);
                    } catch (error) {
                        logger.warn(`Cann't update phone number`);
                    }

                } else if (msg.text) {

                    if (msg.text.length === 9 && !isNaN(parseFloat(msg.text))) {
    
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
        
                    const name = userInfo.firstname.split(' ');

                    const newUser = await axios.post('http://soliton.net.ua/water/api/user/add/index.php', {
                        phone_number: userInfo.phone,
                        first_name: name[0],
                        last_name: name[1] ? name[1] : 'не вказано',
                        date_birth: msg.text,
                        email: 'example@gmail.com'
                    });
        
                    const userCard = await axios.get(`http://soliton.net.ua/water/api/user/index.php?phone=${userInfo.phone}`);
        
                    await updateUserByChatId(chatId, { lastname: userCard.data.user.uid });
        
                    const apiUser = await findApiUserByChatId(chatId);
                    
                    apiUser ? await updateApiUserByChatId(chatId, {
                        user_id: userCard.data.user.uid,
                        name: userCard.data.user.name,
                        birthdaydate: userCard.data.user.date_birth,
                        phone: userCard.data.user.phone,
                        cards: userCard.data.user.card[0]?.ID          
                    }) : 
                    await createNewApiUser({
                        user_id: userCard.data.user.uid,
                        chat_id: chatId,
                        name: userCard.data.user.name,
                        birthdaydate: userCard.data.user.date_birth,
                        phone: userCard.data.user.phone,              
                    })
        
                    if (newUser.data.status) {
        
                        logger.info(`USER_ID: ${chatId} registered`);
        
                        await createCardApi(chatId, userInfo.phone);
        
                    }  
                } else {

                    await bot.sendMessage(chatId, phrases.wrongBirthDate);

                }
            break;
        }
    });

};

export default introduction;