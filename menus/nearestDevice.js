

const mainMenu = async () => {
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id; 
        
        console.log(`chat ID ${chatId}`)
            
        const apiData = await findApiUserByChatId(chatId); 
  
        console.log(`apiData ${apiData}`)
  
        let card = {};
  
        if (apiData?.cards) {
          card = await findCardById(apiData?.cards);
        }
          
        const userInfo = await findUserByChatId(chatId);
          
  
        let dialogueStatus, isAuthenticated, birthDaydate, tempData, userDatafromApi, balance, cardNumber, firstname, cardCard;

        if (userInfo) {
            dialogueStatus = userInfo.dialoguestatus;
            isAuthenticated = userInfo.isAuthenticated;
            birthDaydate = userInfo.birthdaydate;
  
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
            if (userInfo.hasOwnProperty("firstname")) {
              firstname = userInfo.firstname;
            }
            if (card.hasOwnProperty("Card")) {
              cardCard = card.cardId;
            }
            
        }

        switch (msg.text) {
            
             case '/start':
               if(userInfo) await updateUserByChatId(chatId, { dialoguestatus: '' });
               if (isAuthenticated) {
                 bot.sendMessage(msg.chat.id, phrases.mainMenu, {
                   reply_markup: { keyboard: keyboards.mainMenu, resize_keyboard: true, one_time_keyboard: true }
                 }); 
                } else {
                  
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
        }
    });

};

export default mainMenu;