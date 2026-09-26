import { phrases } from "../language_ua.js";
import { bot } from "../app.js";
import { logger } from "../logger/index.js";
import { getCardData } from "./checkcardAPI.js";
import axios from "axios";
import getUserTransactions from "../user-transactions.js";

const toNum = (value) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Soliton quirk: some devices (e.g. 247) pour from card balance with mt_bn=0,
 * and only show the debit in bonus_on_card_before → bonus_on_card_after.
 */
const classifyTransaction = (transaction) => {
  const cardPay = toNum(transaction.cardPaymant);
  const cashPay = toNum(transaction.cashPaymant);
  const onlinePay = toNum(transaction.onlinePaymant);
  const water = toNum(transaction.waterFullfilled);
  const bonusBefore = toNum(transaction.bonusBefore);
  const bonusAfter = toNum(transaction.bonusAfter);
  const bonusDelta = bonusBefore - bonusAfter;

  const paidFromBalance = cardPay !== 0 || bonusDelta > 0.01;
  const paidCashOrOnline = cashPay !== 0 || onlinePay !== 0;
  const hasPour = water > 0;
  // Incomplete only when NOTHING happened (all payment fields zero AND no pour AND no bonus debit)
  const incomplete =
    !paidFromBalance && !paidCashOrOnline && !hasPour;

  const paymantAmount = cashPay || cardPay || onlinePay || 0;

  return {
    cardPay,
    cashPay,
    onlinePay,
    water,
    bonusDelta,
    paidFromBalance,
    paidCashOrOnline,
    hasPour,
    incomplete,
    paymantAmount,
  };
};

const checkPayment = async (chatID, deviceId, cardId, phone, user_id) => {
  setTimeout(async () => {
    const card = await getCardData(user_id, cardId);

    const transaction = await getUserTransactions(deviceId, 4, cardId);

    const balance = card?.WaterQty / 10;
    const deviceData = await axios.post(
      "https://soliton.net.ua/water/api/prices/index.php",
      {
        device_id: deviceId,
      }
    );

    const devicePrices = deviceData.data?.prices;

    const price = devicePrices?.P_1_std / 100;

    if (transaction) {
      const classified = classifyTransaction(transaction);
      const { paymantAmount, paidFromBalance, paidCashOrOnline, hasPour, incomplete } =
        classified;
      const bonus = price
        ? ((paymantAmount / price) * (card?.Discount || 0)) / 100
        : 0;

      if (paidFromBalance || (hasPour && !paidCashOrOnline)) {
        bot.sendMessage(
          chatID,
          `Набрано ${transaction?.waterFullfilled} л. з балансу. 
Залишок на балансі складає ${balance} л. Дякуємо, пийте на здоров'я`
        );

        logger.info(
          `#️⃣ ${chatID} 📱 ${phone} З балансу карти налито: ${transaction?.waterFullfilled} л.` +
            (classified.bonusDelta > 0.01
              ? ` (bonus Δ ${classified.bonusDelta.toFixed(1)})`
              : "")
        );

        //update achievements
      } else if (incomplete) {
        logger.info(
          `#️⃣ ${chatID} 📱 ${phone} Активував автомат але не завершив оплату`
        );
      } else {
        bot.sendMessage(
          chatID,
          `Внесено: ${paymantAmount} грн, налито: ${transaction?.waterFullfilled} л. за ціною ${price} грн/літр.
                    Плюс на Ваш баланс нараховано бонус ${bonus} л., загалом баланс складає ${balance} л.. Дякуємо за покупку, пийте на здоров'я 💧`
        );

        logger.info(
          `#️⃣ ${chatID} 📱 ${phone} Внесено: ${paymantAmount} грн, налито: ${transaction?.waterFullfilled} л. за ціною ${price} грн/літр + бонус ${bonus} л.`
        );
      }
    } else {
      logger.info(
        `#️⃣ ${chatID} 📱 ${phone} Активував автомат для оплати готівкою але не завершив оплату`
      );
    }
  }, 60 * 1000 * 4);
};

const checkPaymentCard = async (chatID, deviceId, cardId, phone, user_id) => {
  setTimeout(async () => {
    const card = await getCardData(user_id, cardId);

    const transaction = await getUserTransactions(deviceId, 4, cardId);

    const balance = card?.WaterQty / 10;
    const deviceData = await axios.post(
      "https://soliton.net.ua/water/api/prices/index.php",
      {
        device_id: deviceId,
      }
    );

    const devicePrices = deviceData.data?.prices;

    const price = devicePrices?.P_1_std / 100;

    if (transaction) {
      const classified = classifyTransaction(transaction);
      const { paymantAmount, paidFromBalance, paidCashOrOnline, hasPour, incomplete } =
        classified;
      const bonus = price
        ? ((paymantAmount / price) * (card?.Discount || 0)) / 100
        : 0;

      if (paidFromBalance || (hasPour && !paidCashOrOnline)) {
        bot.sendMessage(
          chatID,
          `Набрано ${transaction?.waterFullfilled} л. з балансу. 
Залишок на балансі складає ${balance} л. Дякуємо, пийте на здоров'я`
        );

        logger.info(
          `#️⃣ ${chatID} 📱 ${phone} З балансу карти налито: ${transaction?.waterFullfilled} л.  за ціною ${price} грн/літр` +
            (classified.bonusDelta > 0.01
              ? ` (bonus Δ ${classified.bonusDelta.toFixed(1)})`
              : "")
        );
      } else if (incomplete) {
        logger.info(
          `#️⃣ ${chatID} 📱 ${phone} Активував автомат але не завершив оплату`
        );
      } else {
        bot.sendMessage(
          chatID,
          `Внесено: ${paymantAmount} грн, налито: ${transaction?.waterFullfilled} л. за ціною ${price} грн/літр.
                    Плюс на Ваш баланс нараховано бонус ${bonus} л., загалом баланс складає ${balance} л.. Дякуємо за покупку, пийте на здоров'я 💧`
        );

        logger.info(
          `#️⃣ ${chatID} 📱 ${phone} Внесено: ${paymantAmount} грн, налито: ${transaction?.waterFullfilled} л. за ціною ${price} грн/літр + бонус ${bonus} л.`
        );
      }
    } else {
      logger.info(
        `#️⃣ ${chatID} 📱 ${phone} Активував автомат для оплати з балансу але не завершив оплату`
      );
    }
  }, 60 * 1000 * 4);
};

export { checkPayment, checkPaymentCard };
