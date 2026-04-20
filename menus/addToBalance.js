import axios from "axios";
import { bot } from "../app.js";
import { keyboards, phrases } from "../language_ua.js";
import { findApiUserByChatId } from "../models/api-users.js";
import { findCardById } from "../models/cards.js";
import { findUserByChatId, updateUserByChatId } from "../models/users.js";
import activateDevice from "../modules/activate-device.js";
import { checkBalanceChange } from "../modules/checkcardAPI.js";
import { findNearestCoordinate } from "../modules/locations.js";
import { dataBot } from "../values.js";

const addToBalance = async () => {
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    const apiData = await findApiUserByChatId(chatId);

    let card = {};

    if (apiData?.cardId) {
      card = await findCardById(apiData?.cardId);
    }

    const userInfo = await findUserByChatId(chatId);

    let dialogueStatus, tempData, userDatafromApi, cardNumber, cardCard;

    if (userInfo) {
      dialogueStatus = userInfo.dialoguestatus;

      if (userInfo.hasOwnProperty("lastname")) {
        const data = JSON.parse(userInfo.lastname);
        userDatafromApi = data;
      }
      if (userInfo.hasOwnProperty("fathersname")) {
        tempData = userInfo.fathersname;
      }
      if (card.hasOwnProperty("Number")) {
        cardNumber = card?.Number;
      }
      if (card.hasOwnProperty("Card")) {
        cardCard = card.cardId;
      }
    }

    switch (msg.text) {
      case "💸 Поповнити картку":
        bot.sendMessage(chatId, phrases.choosePaymantWay, {
          reply_markup: {
            keyboard: keyboards.choosePaymantWay,
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
        await updateUserByChatId(chatId, {
          dialoguestatus: "cardBalanceRefil",
        });
        break;
    }

    switch (dialogueStatus) {
      case "cardBalanceRefil":
        if (msg.text === "💸 Готівка") {
          bot.sendMessage(chatId, phrases.chooseVendorRefil, {
            reply_markup: {
              keyboard: keyboards.chooseVendor,
              resize_keyboard: true,
              one_time_keyboard: false,
            },
          });
        }
        if (msg.text === "💳 Картка Visa/Mastercard") {
          bot.sendMessage(chatId, phrases.cardRefilCard(cardNumber), {
            reply_markup: {
              keyboard: keyboards.countType,
              resize_keyboard: true,
              one_time_keyboard: false,
            },
          });
        }
        if (!isNaN(msg.text)) {
          const locations = await axios.get(
            "http://soliton.net.ua/water/api/devices"
          );
          const currentVendor = locations.data.devices.find(
            (device) => device.id == msg.text
          );
          if (currentVendor) {
            await updateUserByChatId(chatId, {
              fathersname: JSON.stringify(currentVendor),
            });
            bot.sendMessage(
              chatId,
              `Це автомат "${currentVendor.id}" "${currentVendor.name}"?`,
              {
                reply_markup: {
                  keyboard: keyboards.binarKeys,
                  resize_keyboard: true,
                  one_time_keyboard: true,
                },
              }
            );
          } else {
            bot.sendMessage(
              chatId,
              `Автомата з ID: "${msg.text}" не знайдено`,
              {
                reply_markup: {
                  keyboard: keyboards.mainMenuButton,
                  resize_keyboard: true,
                  one_time_keyboard: true,
                },
              }
            );
          }
        }
        if (msg.text === "Так") {
          const deviceData = JSON.parse(tempData);

          await activateDevice(deviceData.id, cardCard, cardNumber);

          bot.sendMessage(chatId, phrases.readCardRefil, {
            reply_markup: {
              keyboard: keyboards.readCardRefil,
              resize_keyboard: true,
              one_time_keyboard: false,
            },
          });
        }
        if (msg.text === "Ні") {
          bot.sendMessage(chatId, phrases.choosePaymantWay, {
            reply_markup: {
              keyboard: keyboards.choosePaymantWay,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
        }
        if (
          msg.text ===
          `на екрані автомата з'явився напис: "на балансі картки х літрів"`
        ) {
          bot.sendMessage(chatId, phrases.cashRequest, {
            reply_markup: {
              keyboard: keyboards.mainMenuButton,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });

          await checkBalanceChange(chatId, userDatafromApi, apiData?.cardId);
        }
        if (
          msg.text ===
          `Пройшло понад 30 секунд, але напис на екрані автомата так і не з'явився`
        ) {
          bot.sendMessage(msg.chat.id, phrases.choosePaymantWay, {
            reply_markup: {
              keyboard: keyboards.choosePaymantWay,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
        }
        if (msg.location) {
          const locations = await axios.get(
            "http://soliton.net.ua/water/api/devices"
          );
          const targetCoordinate = {
            lat: msg.location.latitude,
            lon: msg.location.longitude,
          };
          const nearest = findNearestCoordinate(
            locations.data.devices,
            targetCoordinate
          );
          await updateUserByChatId(chatId, {
            fathersname: JSON.stringify(nearest),
          });

          bot.sendLocation(chatId, nearest.lat, nearest.lon);
          bot.sendMessage(
            chatId,
            `Це автомат "${nearest.id}" "${nearest.name}"?`,
            {
              reply_markup: {
                keyboard: keyboards.binarKeys,
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            }
          );
          return;
        }

        break;

      case "volumeLink":
        if (!isNaN(msg.text)) {
          const amount = Math.round(msg.text * dataBot.topUpPrice);

          const link = `https://easypay.ua/ua/partners/vodolii1/VODOLII_1_FOP_KMIT-PAY?account=${cardNumber}&amount=${msg.text}`;
          await bot.sendMessage(chatId, phrases.refilInfo, {
            reply_markup: {
              keyboard: keyboards.mainMenuButton,
              resize_keyboard: true,
              one_time_keyboard: false,
            },
          });
          await bot.sendMessage(
            chatId,
            `Поповнення картки номер "${cardNumber}".`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "✨ ОПЛАТИТИ ✨",
                      url: link,
                    },
                  ],
                ],
              },
            }
          );

          checkBalanceChange(chatId, userDatafromApi, apiData?.cardId);
        } else {
          bot.sendMessage(chatId, phrases.wrongNumber);
        }

        break;

      case "amountLink":
        if (!isNaN(msg.text)) {
          const link = `https://easypay.ua/ua/partners/vodolii1/VODOLII_1_FOP_KMIT-PAY?account=${cardNumber}&amount=${msg.text}`;
          await bot.sendMessage(chatId, phrases.refilInfo, {
            reply_markup: {
              keyboard: keyboards.mainMenuButton,
              resize_keyboard: true,
              one_time_keyboard: false,
            },
          });
          await bot.sendMessage(
            chatId,
            `Поповнення картки номер "${cardNumber}".`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "✨ ОПЛАТИТИ ✨",
                      url: link,
                    },
                  ],
                ],
              },
            }
          );

          checkBalanceChange(chatId, userDatafromApi, apiData?.cardId);
        } else {
          bot.sendMessage(chatId, phrases.wrongNumber);
        }

        break;
    }
  });
};

export default addToBalance;
