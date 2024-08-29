// ФАЙЛ СТВОРИВ ДЛЯ ТЕСТУВАННЯ БАЗИ ТА АПІ

import { findUserByChatId, findUserById } from './models/users.js';
import getTransactions from './transactions.js';

const userInfo = await findUserByChatId(305761195);
const userIdInfo = await findUserById(4)

// console.log(userIdInfo)

const device = 179;  // Example device ID
const cardId = 22406;  // Example card ID
const subtractMinutes = 144000;  // Example time range (last 1440 minutes)

const transaction = await getTransactions(device, subtractMinutes, cardId);

if (transaction) {
    console.log('Transaction found and saved:', transaction);
} else {
    console.log('No transaction found for the specified card ID.');
}

