import axios from "axios";
import { bot } from "../app.js";
import { phrases } from "../language_ua.js";
import { logger } from "../logger/index.js";
import { findUserByChatId } from "../models/users.js";
import { dataBot } from "../values.js";

const waterPrice = dataBot.topUpPrice;

const getCardData = async (user_id, card_id) => {
  const url = "https://soliton.net.ua/water/api/card/query/index.php";
  const requestData = {
    user_id,
    card_id,
  };

  const response = await axios.post(url, requestData);
  const card = response.data.card;
  return card;
};
const checkBalanceChange = async (chatId, user_id, card_id) => {
  const currentBalance = await getCardData(user_id, card_id);
  const beforeWater = currentBalance.WaterQty;

  const PING_INTERVAL = 5000; // 5 секунд
  const MAX_TIME = 60000 * 4; // 4 хвилини загального очікування
  let timeSpent = 0;

  const poll = async () => {
    try {
      const balance = await getCardData(user_id, card_id);
      const afterWater = balance.WaterQty;

      // Сценарій 1: Баланс змінився — успіх
      if (beforeWater !== afterWater) {
        const balanceChange = afterWater - beforeWater;
        await sendResult(chatId, balanceChange, balance.Discount);
        return; // Виходимо з рекурсії
      }

      // Додаємо час, який пройшов
      timeSpent += PING_INTERVAL;

      // Сценарій 2: Тайм-аут (минув макс. час очікування) — помилка
      if (timeSpent >= MAX_TIME) {
        await bot.sendMessage(chatId, phrases.bonusNotificationCardError);
        logger.warn(
          `Користувач ${chatId} не завершив оплату. (user: ${user_id}, card: ${card_id})`
        );
        return; // Виходимо з рекурсії
      }

      // Сценарій 3: Змін немає, час ще є — плануємо наступний пінг
      setTimeout(poll, PING_INTERVAL);
    } catch (error) {
      logger.error(
        `Помилка під час пулінгу балансу для ${chatId}: ${error.message}`
      );
      // Навіть у разі помилки API, продовжуємо пробувати, поки не вийде таймаут
      timeSpent += PING_INTERVAL;
      if (timeSpent < MAX_TIME) {
        setTimeout(poll, PING_INTERVAL);
      } else {
        await bot.sendMessage(chatId, phrases.bonusNotificationCardError);
      }
    }
  };

  // Запускаємо перший пінг через 5 секунд
  setTimeout(poll, PING_INTERVAL);
};
/*
const checkBalanceChange = async (chatId, user_id, card_id) => {
  const currentBalance = await getCardData(user_id, card_id);
  const beforeWater = currentBalance.WaterQty;
  setTimeout(async () => {
    const balance = await getCardData(user_id, card_id);
    const afterWater = balance.WaterQty;
    if (beforeWater !== afterWater) {
      const balanceChange = afterWater - beforeWater;

      sendResult(chatId, balanceChange, balance.Discount);
    } else {
      setTimeout(async () => {
        const balance = await getCardData(user_id, card_id);
        const afterWater = balance.WaterQty;

        if (beforeWater !== afterWater) {
          const balanceChange = afterWater - beforeWater;

          sendResult(chatId, balanceChange, balance.Discount);
        } else {
          bot.sendMessage(chatId, phrases.bonusNotificationCardError);

          logger.warn(
            `id користувача ${chatId} не завершив оплату  ${(user_id, card_id)}`
          );
        }
      }, 60000 * 2);
    }
  }, 60000 * 2);
};
*/
const checkBalanceChangeForCardPayment = async (chatId, user_id, card_id) => {
  const checkInterval = 10000; // Інтервал перевірки - 10 секунд
  const maxAttempts = 30; // Максимальна кількість спроб (5 хвилин)

  const currentBalance = await getCardData(user_id, card_id);
  const beforeWater = currentBalance.WaterQty;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, checkInterval));

    const balance = await getCardData(user_id, card_id);
    const afterWater = balance.WaterQty;

    if (beforeWater !== afterWater) {
      const balanceChange = afterWater - beforeWater;
      sendResult(chatId, balanceChange, balance.Discount);
      return (balanceChange / 10).toFixed(2); // Успішно завершено
    }
  }

  // Якщо цикл завершився без успіху
  bot.sendMessage(chatId, phrases.bonusNotificationCardError);
  logger.warn(
    `id користувача ${chatId} не завершив оплату ${user_id}, ${card_id}`
  );
  return false; // Заключний блок
};

const sendResult = async (chatId, balanceChange, discount) => {
  if (balanceChange > 0) {
    const liters = (balanceChange / 10).toFixed(2);

    const totalWithoutBonus = (liters / (1 + discount / 100)).toFixed(2);

    const bonusAmount = (liters - totalWithoutBonus).toFixed(2);

    const litersPrice = (totalWithoutBonus * waterPrice).toFixed(2);

    const userData = await findUserByChatId(chatId);

    logger.info(
      `Внесено: ${litersPrice} грн, куплено: ${liters} літра. Користувач ${userData.phone}`
    );

    bot.sendMessage(
      chatId,
      phrases.bonusNotificationCard(
        totalWithoutBonus,
        litersPrice,
        bonusAmount,
        waterPrice,
        liters
      )
    );
  }
};

export { getCardData, checkBalanceChange, checkBalanceChangeForCardPayment };
