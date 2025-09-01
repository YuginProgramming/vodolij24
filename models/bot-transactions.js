import { Model, DataTypes } from "sequelize";
import { sequelize } from "./sequelize.js";
import { logger } from "../logger/index.js";

import { Op } from "sequelize";
import { Transaction } from "./transactions.js";

class BotTransaction extends Model {}
BotTransaction.init(
  {
    device: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      unique: false,
    },
    waterRequested: {
      type: DataTypes.FLOAT,
      allowNull: true,
      unique: false,
    },
    waterFullfilled: {
      type: DataTypes.FLOAT,
      allowNull: true,
      unique: false,
    },
    cashPaymant: {
      type: DataTypes.FLOAT,
      allowNull: true,
      unique: false,
    },
    cardPaymant: {
      type: DataTypes.FLOAT,
      allowNull: true,
      unique: false,
    },
    onlinePaymant: {
      type: DataTypes.FLOAT,
      allowNull: true,
      unique: false,
    },
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: false,
    },
  },
  {
    freezeTableName: false,
    timestamps: false,
    modelName: "bot-transactions",
    sequelize,
  }
);

const copyUsersTransactionsByTheDay = async (cardId) => {
  const getYesterdayDateRange = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Скидаємо години, хвилини, секунди
    const startOfYesterday = new Date(now);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const endOfYesterday = new Date(startOfYesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    // Форматуємо дату без часу (YYYY-MM-DD)
    const statDate = startOfYesterday.toISOString().split("T")[0];

    return { startOfYesterday, endOfYesterday, statDate };
  };

  const { startOfYesterday, endOfYesterday } = getYesterdayDateRange();

  try {
    // Отримуємо всі транзакції користувача за вчора
    const transactions = await Transaction.findAll({
      where: {
        cardId,
        date: {
          [Op.between]: [startOfYesterday, endOfYesterday],
        },
      },
    });

    if (!transactions.length) {
      return;
    }

    // Формуємо масив для вставки
    const transactionsToInsert = transactions.map((t) => ({
      user_id: t.user_id,
      device: t.device,
      date: t.date,
      waterRequested: t.waterRequested,
      waterFullfilled: t.waterFullfilled,
      cashPaymant: t.cashPaymant,
      cardPaymant: t.cardPaymant,
      onlinePaymant: t.onlinePaymant,
      paymantChange: t.paymantChange,
      isAutorized: t.isAutorized,
      cardId: t.cardId,
    }));

    // Масово вставляємо записи
    await BotTransaction.bulkCreate(transactionsToInsert);

    console.log(
      `✅ Успішно скопійовано ${transactions.length} транзакцій для картки ${cardId}.`
    );
  } catch (err) {
    console.error(`❌ Помилка при копіюванні транзакцій: ${err}`);
  }
};

const getBotUserTotalbyTheDay = async (cardId) => {
  let res = 0;

  const today = new Date();

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
  const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

  try {
    const totalWaterFulfilled = await BotTransaction.sum("waterFullfilled", {
      where: {
        cardId,

        date: {
          [Op.between]: [startOfYesterday, endOfYesterday],
        },
      },
    });

    return totalWaterFulfilled || 0;
  } catch (err) {
    logger.error(`Impossible to request sum: ${err}`);
  }
  return res;
};

export {
  BotTransaction,
  copyUsersTransactionsByTheDay,
  getBotUserTotalbyTheDay,
};
