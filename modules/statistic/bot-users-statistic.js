import { bot } from "../../app.js";
import { logger } from "../../logger/index.js";
import { findAllUsers } from "../../models/api-users.js";
import { getUsersTotalbyTheDay, getUsersTotalByWeek, getUsersTotalByMonth } from "../../models/transactions.js";
import { dataBot } from "../../values.js";




const botUsersStatistic = async () => {
    const users = await findAllUsers();
    const usersWithTotals = [];

    for (let user of users) {
        const cardId = user?.cards;
        let userTotal = 0;

        if (cardId) {
            userTotal = await getUsersTotalbyTheDay(cardId);
        }

        usersWithTotals.push({
            id: user.id,
            name: user.name,
            birthdayDate: user.birthdayDate,
            phone: user.phone,
            cards: cardId,
            userTotal
        });
    }

    // Сортуємо користувачів за userTotal у порядку спадання
    const topUsers = usersWithTotals
        .sort((a, b) => b.userTotal - a.userTotal)
        .slice(0, 10); // Отримуємо топ-10

    // Формуємо повідомлення для топ-10 користувачів
    const topUsersMessage = topUsers.map(user => {
        return `ID: ${user.id}, Імя: ${user.name}, ДН: ${user.birthdayDate}, ТЕЛ: ${user.phone}, Карта: ${user.cards}, Набрано: ${user.userTotal.toFixed(0)} літрів`;
    }).join('\n');

    logger.info(`Топ 10 користувачів:\n${topUsersMessage}`);

    // Логуюємо загальну кількість користувачів та воду
    const usersQuantity = users.length;
    const usersWaterTotal = usersWithTotals.reduce((sum, user) => sum + user.userTotal, 0);

    const summaryString = `Користувачів боту: ${usersQuantity},\nКількість налитої води, користувачами боту, за добу: ${usersWaterTotal.toFixed(0)} літрів.`;
    logger.info(summaryString);
};

const botWeeklyUsersStatistic = async () => {
    const users = await findAllUsers();
    const usersWithTotals = [];

    for (let user of users) {
        const cardId = user?.cards;
        let userTotal = 0;

        if (cardId) {
            userTotal = await getUsersTotalByWeek(cardId);
        }

        usersWithTotals.push({
            id: user.id,
            name: user.name,
            birthdayDate: user.birthdayDate,
            phone: user.phone,
            cards: cardId,
            userTotal
        });
    }

    // Сортуємо користувачів за userTotal у порядку спадання
    const topUsers = usersWithTotals
        .sort((a, b) => b.userTotal - a.userTotal)
        .slice(0, 10); // Отримуємо топ-10

    // Формуємо повідомлення для топ-10 користувачів
    const topUsersMessage = topUsers.map(user => {
        return `ID: ${user.id}, Імя: ${user.name}, ДН: ${user.birthdayDate}, ТЕЛ: ${user.phone}, Карта: ${user.cards}, Набрано: ${user.userTotal.toFixed(0)} літрів`;
    }).join('\n');

    bot.sendMessage(dataBot.topId, `Топ 10 користувачів за тиждень:\n${topUsersMessage}`);

    // Логуюємо загальну кількість користувачів та воду
    const usersQuantity = users.length;
    const usersWaterTotal = usersWithTotals.reduce((sum, user) => sum + user.userTotal, 0);

    const summaryString = `Користувачів боту: ${usersQuantity},\nКількість налитої води, користувачами боту, за тиждень: ${usersWaterTotal.toFixed(0)} літрів.`;
    bot.sendMessage(dataBot.topId, summaryString);
};

const botMonthlyUsersStatistic = async () => {
    const users = await findAllUsers();
    const usersWithTotals = [];

    for (let user of users) {
        const cardId = user?.cards;
        let userTotal = 0;

        if (cardId) {
            userTotal = await getUsersTotalByMonth(cardId);
        }

        usersWithTotals.push({
            id: user.id,
            name: user.name,
            birthdayDate: user.birthdayDate,
            phone: user.phone,
            cards: cardId,
            userTotal
        });
    }

    // Сортуємо користувачів за userTotal у порядку спадання
    const topUsers = usersWithTotals
        .sort((a, b) => b.userTotal - a.userTotal)
        .slice(0, 10); // Отримуємо топ-10

    // Формуємо повідомлення для топ-10 користувачів
    const topUsersMessage = topUsers.map(user => {
        return `ID: ${user.id}, Імя: ${user.name}, ДН: ${user.birthdayDate}, ТЕЛ: ${user.phone}, Карта: ${user.cards}, Набрано: ${user.userTotal.toFixed(0)} літрів`;
    }).join('\n');

    bot.sendMessage(dataBot.topId, `Топ 10 користувачів за місяць:\n${topUsersMessage}`);

    // Логуюємо загальну кількість користувачів та воду
    const usersQuantity = users.length;
    const usersWaterTotal = usersWithTotals.reduce((sum, user) => sum + user.userTotal, 0);

    const summaryString = `Користувачів боту: ${usersQuantity},\nКількість налитої води, користувачами боту, за місяць: ${usersWaterTotal.toFixed(0)} літрів.`;
    bot.sendMessage(dataBot.topId, summaryString);
};


export  {
    botUsersStatistic,
    botWeeklyUsersStatistic,
    botMonthlyUsersStatistic
} 

