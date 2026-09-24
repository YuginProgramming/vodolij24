import TelegramBot from "node-telegram-bot-api";
import { anketaListiner } from "./anketa.js";
import { dataBot } from "./values.js";
import { decodeQR } from "./qrdecode.js";
import { sequelize } from "./models/sequelize.js";
import getStatistic from "./statistic.js";
import cron from "node-cron";

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

const maintenanceMode = false;

const maintenanceText =
  "На жаль, зараз бот тимчасово недоступний через затяжні атаки дронів. Незабаром плануємо відновити його роботу. Раніше куплені літри води збережено і скоро знову будуть доступні.";

if (maintenanceMode) {
  bot.on("message", (msg) => {
    bot.sendMessage(msg.chat.id, maintenanceText).catch(() => {});
  });
  bot.on("callback_query", async (query) => {
    try {
      await bot.answerCallbackQuery(query.id);
    } catch {
      // ignore expired button presses
    }
    bot.sendMessage(query.message.chat.id, maintenanceText).catch(() => {});
  });
} else {
  main();
  anketaListiner();
  //decodeQR();
  mainMenu();
  introduction();
  buyWater();
  addToBalance();
  profile();
}