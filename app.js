import TelegramBot from "node-telegram-bot-api";
import { anketaListiner } from "./anketa.js";
import { dataBot } from "./values.js";
import { sequelize } from "./models/sequelize.js";
import getStatistic from "./statistic.js";
import cron from "node-cron";
import {
  botUsersStatistic,
  botWeeklyUsersStatistic,
  botMonthlyUsersStatistic,
} from "./modules/statistic/bot-users-statistic.js";
import mainMenu from "./menus/main.js";
import introduction from "./menus/introduction.js";
import buyWater from "./menus/buyWater.js";
import addToBalance from "./menus/addToBalance.js";
import profile from "./menus/profile.js";

const bot = new TelegramBot(dataBot.telegramBotToken, { polling: true });

export { bot };

const main = async () => {
  const models = {
    list: ["users"],
  };
  // DB
  const configTables = models.list;
  const dbInterface = sequelize.getQueryInterface();
  const checks = await Promise.all(
    configTables.map((configTable) => {
      return dbInterface.tableExists(configTable);
    })
  );
  const result = checks.every((el) => el === true);
  if (!result) {
    // eslint-disable-next-line no-console
    console.error(`🚩 Failed to check DB tables, see config.models.list`);
    throw `Some DB tables are missing`;
  }
};

main();

anketaListiner();
mainMenu();
introduction();
buyWater();
addToBalance();
profile();

if (dataBot?.statistic === true) {
  cron.schedule(
    "0 0 * * *",
    () => {
      getStatistic();
    },
    {
      scheduled: true,
      timezone: "Europe/Kiev",
    }
  );

  cron.schedule(
    "0 0 * * 0",
    () => {
      // Щонеділі о 00:00
      botWeeklyUsersStatistic();
    },
    {
      scheduled: true,
      timezone: "Europe/Kiev",
    }
  );

  cron.schedule(
    "0 0 1 * *",
    () => {
      // 1-го числа кожного місяця о 00:00
      botMonthlyUsersStatistic();
    },
    {
      scheduled: true,
      timezone: "Europe/Kiev",
    }
  );

  cron.schedule(
    "30 0 * * *",
    () => {
      //30 хв після опівночі
      botUsersStatistic();
    },
    {
      scheduled: true,
      timezone: "Europe/Kiev",
    }
  );
}
