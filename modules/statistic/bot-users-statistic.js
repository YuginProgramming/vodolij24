import { logger } from "../../logger/index.js";
import { findAllUsers } from "../../models/api-users.js";
import { getUsersTotalbyTheDay, getUsersTotalByWeek, getUsersTotalByMonth } from "../../models/transactions.js";




const botUsersStatistic = async () => {

    const users = await findAllUsers();

    const usersQuantity = users.length;

    let usersWaterTotal = 0;

    for (let user of users) {

       const cardId = user?.cards;

       console.log(cardId)

       if (cardId) {

        const userTotal = await getUsersTotalbyTheDay(cardId);

        console.log(userTotal)

        usersWaterTotal += userTotal;

       }      

    }

    const string = `Користувачів боту ${usersQuantity},
                Кількість налитої води, користувачами боту, за добу: ${usersWaterTotal} літрів.`; 

    logger.info(string);

};

const botWeeklyUsersStatistic = async () => {

    const users = await findAllUsers();

    const usersQuantity = users.length;

    let usersWaterTotal = 0;

    for (let user of users) {

       const cardId = user?.cards;

       console.log(cardId)

       if (cardId) {

        const userTotal = await getUsersTotalByWeek(cardId);

        console.log(userTotal)

        usersWaterTotal += userTotal;

       }      

    }

    const string = `Користувачів боту ${usersQuantity},
                Кількість налитої води, користувачами боту, за тиждень: ${usersWaterTotal} літрів.`; 

    logger.info(string);

};

const botMonthlyUsersStatistic = async () => {

    const users = await findAllUsers();

    const usersQuantity = users.length;

    let usersWaterTotal = 0;

    for (let user of users) {

       const cardId = user?.cards;

       console.log(cardId)

       if (cardId) {

        const userTotal = await getUsersTotalByMonth(cardId);

        console.log(userTotal)

        usersWaterTotal += userTotal;

       }      

    }

    const string = `Користувачів боту ${usersQuantity},
                Кількість налитої води, користувачами боту, за місяць: ${usersWaterTotal} літрів.`; 

    logger.info(string);

};

export  {
    botUsersStatistic,
    botWeeklyUsersStatistic,
    botMonthlyUsersStatistic
} 

