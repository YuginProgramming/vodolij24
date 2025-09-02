import axios from "axios";
import { bot } from "../app.js";
import { keyboards, phrases } from "../language_ua.js";
import { findApiUserByChatId } from "../models/api-users.js";
import { findCardById } from "../models/cards.js";
import { findUserByChatId, updateUserByChatId } from "../models/users.js";
import activateDevice from "../modules/activate-device.js";
import { checkPayment, checkPaymentCard } from "../modules/checkpaymant.js";
import { findNearestCoordinate } from "../modules/locations.js";
import { checkBalanceChangeForCardPayment } from "../modules/checkcardAPI.js";
import { logger } from "../logger/index.js";

const buyWater = () => {
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    const apiData = await findApiUserByChatId(chatId);

    let card = {};

    if (apiData?.cardId) {
      card = await findCardById(apiData?.cardId);
    }

    const userInfo = await findUserByChatId(chatId);

    let dialogueStatus,
      tempData,
      userDatafromApi,
      cardNumber,
      cardCard,
      favoriteDevice;

    if (userInfo) {
      dialogueStatus = userInfo.dialoguestatus;

      if (userInfo.hasOwnProperty("lastname")) {
        console.log(userInfo.lastname);
        const data = JSON.parse(userInfo.lastname);
        console.log(data);
        userDatafromApi = data;
      }

      if (userInfo.hasOwnProperty("fathersname")) {
        tempData = userInfo.fathersname;
      }

      if (userInfo.hasOwnProperty("favoriteDevice")) {
        favoriteDevice = userInfo.favoriteDevice;
      }

      if (card.hasOwnProperty("Number")) {
        cardNumber = card?.Number;
      }

      if (card.hasOwnProperty("Card")) {
        cardCard = card.cardId;
      }
    }
    //Незрозуміло чи це працюючий код закоментю

    if (msg.text) {
      const command = msg.text.split("%");

      if (command && command[0] === "linkCard") {
        await createCardApi(command[1], command[2]);
      }
    }

    switch (msg.text) {
      case "🔄 Змінити автомат":
        await bot.sendMessage(chatId, phrases.chooseVendor, {
          reply_markup: {
            keyboard: keyboards.chooseVendor,
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });

        await updateUserByChatId(chatId, { dialoguestatus: "buyWater" });

        break;

      case "⛽️ Купити воду":
        if (favoriteDevice) {
          const locations = await axios.get(
            "http://soliton.net.ua/water/api/devices"
          );
          const currentVendor = locations.data.devices.find(
            (device) => device.id == favoriteDevice
          );

          if (!currentVendor) {
            bot.sendMessage(chatId, phrases.wrongNumber);
            return;
          }

          bot.sendMessage(
            chatId,
            `
            💧 Ваш автомат:
№ ${currentVendor?.id}
📍 Адреса: ${currentVendor?.name}

⭐ Це автомат, який ви регулярно використовуєте!`,
            {
              reply_markup: {
                keyboard: keyboards.paymantMethodFavorite,
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            }
          );

          await updateUserByChatId(chatId, { dialoguestatus: "" });
        } else {
          await bot.sendMessage(chatId, phrases.chooseVendor, {
            reply_markup: {
              keyboard: keyboards.chooseVendor,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });

          await updateUserByChatId(chatId, { dialoguestatus: "buyWater" });
        }

        break;

      case "🚰 Балансом картки Водолій":
        const deviceData = JSON.parse(tempData);

        const deviceActivated = await activateDevice(
          deviceData.id,
          cardCard,
          cardNumber
        );

        if (deviceActivated) {
          bot.sendMessage(chatId, phrases.useCard, {
            reply_markup: {
              keyboard: keyboards.mainMenuButton,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });

          checkPaymentCard(
            chatId,
            deviceData.id,
            apiData?.cardId,
            cardNumber,
            apiData.user_id
          );
        } else {
          bot.sendMessage(chatId, phrases.activationError, {
            reply_markup: {
              keyboard: keyboards.mainMenuButton,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
        }

        break;

      case "💳 Картка Visa/Mastercard":
        if (dialogueStatus != "cardBalanceRefil") {
          bot.sendMessage(chatId, phrases.countType, {
            reply_markup: {
              keyboard: keyboards.countType,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
        }

        break;

      case "💸 Готівкою":
        if (dialogueStatus != "cardBalanceRefil") {
          const deviceData = JSON.parse(tempData);

          const deviceActivated = await activateDevice(
            deviceData.id,
            cardCard,
            cardNumber
          );

          if (deviceActivated) {
            bot.sendMessage(chatId, phrases.vendorActivation, {
              reply_markup: {
                keyboard: keyboards.mainMenuButton,
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            });

            const apiUser = await findApiUserByChatId(chatId);

            checkPayment(
              chatId,
              deviceData.id,
              apiData?.cardId,
              cardNumber,
              apiData.user_id
            );
          } else {
            bot.sendMessage(chatId, phrases.activationError, {
              reply_markup: {
                keyboard: keyboards.mainMenuButton,
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            });
          }
        }

        break;

      case "Ввести суму в літрах":
        if (dialogueStatus === "cardBalanceRefil") {
          bot.sendMessage(chatId, phrases.litrRules, {
            reply_markup: {
              keyboard: keyboards.litrRules,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });

          await updateUserByChatId(chatId, { dialoguestatus: "volumeLink" });
        } else {
          bot.sendMessage(chatId, phrases.litrRules, {
            reply_markup: {
              keyboard: keyboards.litrRules,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });

          await updateUserByChatId(chatId, { dialoguestatus: "volume" });
        }

        break;

      case "Ввести суму в грн":
        if (dialogueStatus === "cardBalanceRefil") {
          bot.sendMessage(chatId, phrases.litrRules);

          await updateUserByChatId(chatId, { dialoguestatus: "amountLink" });
        } else {
          bot.sendMessage(chatId, phrases.amountRules);

          await updateUserByChatId(chatId, { dialoguestatus: "amount" });
        }

        break;
    }

    switch (dialogueStatus) {
      case "buyWater":
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
            dialoguestatus: "vendorConfirmation",
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

        if (!isNaN(msg.text)) {
          const locations = await axios.get(
            "http://soliton.net.ua/water/api/devices"
          );
          const currentVendor = locations.data.devices.find(
            (device) => device.id == msg.text
          );

          if (!currentVendor) {
            bot.sendMessage(chatId, phrases.wrongNumber);
            return;
          }

          await updateUserByChatId(chatId, {
            dialoguestatus: "vendorConfirmation",
            fathersname: JSON.stringify(currentVendor),
          });

          bot.sendMessage(
            chatId,
            `Це автомат "${currentVendor?.id}" "${currentVendor?.name}"?`,
            {
              reply_markup: {
                keyboard: keyboards.binarKeys,
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            }
          );
        } else {
          bot.sendMessage(chatId, phrases.wrongNumber);
        }

        break;

      case "vendorConfirmation":
        const deviceData = JSON.parse(tempData);

        if (msg.text === "Так" || msg.text === "Вибрати інший спосіб оплати") {
          bot.sendMessage(
            msg.chat.id,
            `Покупка води на автоматі "${deviceData.id}" за адресою "${deviceData.name}". Оберіть спосіб оплати`,
            {
              reply_markup: {
                keyboard: keyboards.paymantMethod,
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            }
          );

          const update = await updateUserByChatId(chatId, {
            dialoguestatus: "",
            favoriteDevice: deviceData.id,
          });
          console.log("update");
          console.log(update);

          //тут починається шлях поповнення
        } else {
          bot.sendMessage(chatId, phrases.chooseVendor, {
            reply_markup: {
              keyboard: keyboards.chooseVendor,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });

          await updateUserByChatId(chatId, { dialoguestatus: "buyWater" });
        }
        break;

      case "volume":
        if (!isNaN(msg.text)) {
          const deviceData = JSON.parse(tempData);
          const deviceDataApi = await axios.post(
            "https://soliton.net.ua/water/api/prices/index.php",
            {
              device_id: deviceData.id,
            }
          );

          const devicePrices = deviceDataApi.data?.prices;

          const price = devicePrices?.P_1_std / 100;
          const deviceActivated = await activateDevice(
            deviceData.id,
            cardCard,
            cardNumber
          );
          const link = `https://easypay.ua/ua/partners/vodoleylviv?account=${
            deviceData.id
          }&amount=${msg.text * price}`;
          await bot.sendMessage(
            chatId,
            `Ви купуєте ${msg.text} л води в автоматі №${deviceData.id}.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Оплатити",
                      url: link,
                    },
                  ],
                ],
              },
            }
          );
          await bot.sendMessage(chatId, phrases.pressStart, {
            reply_markup: {
              keyboard: keyboards.mainMenuButton,
              resize_keyboard: true,
              one_time_keyboard: false,
            },
          });
          const apiUser = await findApiUserByChatId(chatId);

          checkPayment(
            chatId,
            deviceData.id,
            cardCard,
            cardNumber,
            apiUser.user_id
          );
          //checkBalanceChange(chatId, apiUser.user_id, cardCard);
        } else {
          bot.sendMessage(chatId, phrases.wrongNumber);
        }
        break;

      case "amount":
        if (!isNaN(msg.text)) {
          const deviceData = JSON.parse(tempData);
          const deviceActivated = await activateDevice(
            deviceData.id,
            cardCard,
            cardNumber
          );
          const link = `https://easypay.ua/ua/partners/vodoleylviv?account=${deviceData.id}&amount=${msg.text}`;
          console.log(link);
          await bot.sendMessage(
            chatId,
            `Ви купуєте воду на ${msg.text} грн в автоматі №${deviceData.id}.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Оплатити",
                      url: link,
                    },
                  ],
                ],
              },
            }
          );
          await bot.sendMessage(chatId, phrases.pressStart, {
            reply_markup: {
              keyboard: keyboards.mainMenuButton,
              resize_keyboard: true,
              one_time_keyboard: false,
            },
          });

          if (userInfo) console.log(userInfo);

          const apiUser = await findApiUserByChatId(chatId);

          checkPayment(
            chatId,
            deviceData.id,
            cardCard,
            cardNumber,
            apiUser.user_id
          );
          //checkBalanceChange(chatId, apiUser.user_id, cardCard);
        } else {
          bot.sendMessage(chatId, phrases.wrongNumber);
        }
        break;
    }
  });
};

export default buyWater;
