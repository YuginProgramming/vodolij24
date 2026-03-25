import axios from "axios";
import { bot } from "../app.js";
import { phrases } from "../language_ua.js";
import { logger } from "../logger/index.js";
import {
  createNewApiUser,
  findApiUserByChatId,
  updateApiUserByChatId,
} from "../models/api-users.js";
import { findUserByChatId, updateUserByChatId } from "../models/users.js";
import createCardApi from "../modules/createCard.js";

const removeApostrophes = (text) => {
  if (!text) return "";
  // Регулярний вираз шукає: ' (звичайний), ’ (курсивний), ` (бекток)
  return text.replace(/['’`]/g, "");
};

const formatBirthDate = (input) => {
  // 1. Витягуємо тільки цифри
  const digits = input.replace(/\D/g, "");

  // 2. Якщо це явно номер телефону (починається на 0 та довгий) — ігноруємо
  if (
    digits.length >= 10 &&
    (digits.startsWith("0") || digits.startsWith("380"))
  ) {
    return null;
  }

  let day, month, year;

  // Варіант: 19921009 (РРРРММДД)
  if (
    (digits.length === 8 && digits.startsWith("19")) ||
    digits.startsWith("20")
  ) {
    if (parseInt(digits.substring(4, 6)) <= 12) {
      // перевірка що посередині місяць
      year = digits.substring(0, 4);
      month = digits.substring(4, 6);
      day = digits.substring(6, 8);
    }
  }

  // Варіант: 20011995 (ДДММРРРР) — найчастіший
  if (!day && digits.length === 8) {
    day = digits.substring(0, 2);
    month = digits.substring(2, 4);
    year = digits.substring(4, 8);
  }

  // Варіант: 1503 (ДДММ без року) — повертаємо як є або ігноруємо
  if (digits.length === 4) {
    return null; // замало даних для валідної дати
  }

  // 3. Фінальна збірка та валідація
  if (day && month && year) {
    // Перевірка на адекватність
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);

    if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1920 && y < 2027) {
      return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
    }
  }

  return null; // Якщо не вдалося розпізнати
};

const numberFormatFixing = (phone) => {
  if (phone.length == 12) {
    return phone;
  } else if (phone.length == 13) {
    const fixedNumber = phone.slice(1);
    return fixedNumber;
  } else if (phone.length == 10) {
    const fixedNumber = "38" + phone;
    return fixedNumber;
  } else if (phone.length == 9) {
    const fixedNumber = "380" + phone;
    return fixedNumber;
  } else if (phone.length == 11) {
    const fixedNumber = "3" + phone;
    return fixedNumber;
  }
};

const introduction = async () => {
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    const userInfo = await findUserByChatId(chatId);

    let dialogueStatus, birthDaydate, firstname;

    if (userInfo) {
      dialogueStatus = userInfo.dialoguestatus;
      birthDaydate = userInfo.birthdaydate;

      if (userInfo.hasOwnProperty("firstname")) {
        firstname = userInfo.firstname;
      }
    }

    if (msg.text === "Ні, я введу номер вручну")
      bot.sendMessage(msg.chat.id, phrases.phoneRules);

    switch (dialogueStatus) {
      case "phoneNumber":
        if (msg.contact) {
          const phone = numberFormatFixing(msg.contact.phone_number);

          try {
            await updateUserByChatId(chatId, { phone, dialoguestatus: "name" });
            await bot.sendMessage(chatId, phrases.nameRequest);
          } catch (error) {
            logger.warn(`Cann't update phone number`);
          }
        } else if (msg.text) {
          const rawPhone = msg.text.replace(/\D/g, "");
          if (rawPhone.length >= 9 && rawPhone.length <= 13) {
            const phone = numberFormatFixing(msg.text);

            try {
              await updateUserByChatId(chatId, {
                phone,
                dialoguestatus: "name",
              });
              await bot.sendMessage(chatId, phrases.nameRequest);
            } catch (error) {
              logger.warn(`Cann't update phone number`);
            }
          } else {
            await bot.sendMessage(chatId, phrases.wrongPhone);
          }
        }

        break;

      case "name":
        const fixedName = removeApostrophes(msg.text);
        await updateUserByChatId(chatId, {
          firstname: fixedName,
          dialoguestatus: "birthdaydate",
        });
        await bot.sendMessage(
          chatId,
          `Введіть дату народження у форматі ДД.ММ.РРРР`
        );

        break;

      case "birthdaydate":
        if (msg.text && msg.text.length === 10) {
          const validDate = formatBirthDate(msg.text);

          await updateUserByChatId(chatId, {
            birthdaydate: validDate,
            dialoguestatus: "",
          });

          const name = userInfo.firstname.includes(" ")
            ? userInfo.firstname.split(" ")
            : [userInfo.firstname];

          const newUser = await axios.post(
            "http://soliton.net.ua/water/api/user/add/index.php",
            {
              phone_number: userInfo.phone,
              first_name: name[0],
              last_name: name[1] ? name[1] : "не вказано",
              date_birth: msg.text,
              email: "example@gmail.com",
            }
          );

          const userCard = await axios.get(
            `http://soliton.net.ua/water/api/user/index.php?phone=${userInfo.phone}`
          );
          try {
            await updateUserByChatId(chatId, {
              lastname: userCard.data.user.uid,
            });
          } catch (error) {
            logger.warn(chatId + "user ID update error" + userInfo.phone);
          }

          const apiUser = await findApiUserByChatId(chatId);

          apiUser
            ? await updateApiUserByChatId(chatId, {
                user_id: userCard.data.user.uid,
                name: userCard.data.user.name,
                birthdaydate: userCard.data.user.date_birth,
                phone: userCard.data.user.phone,
                cardId: Number(userCard.data.user.card[0]?.ID),
              })
            : await createNewApiUser({
                user_id: userCard.data.user.uid,
                chat_id: chatId,
                name: userCard.data.user.name,
                birthdaydate: userCard.data.user.date_birth,
                phone: userCard.data.user.phone,
              });

          if (newUser.data.status) {
            logger.info(
              `USER_ID: ${chatId} registered. ${userCard.data.user.name}, ${userCard.data.user.date_birth}, ${userCard.data.user.phone}`
            );

            await createCardApi(chatId, userInfo.phone);
          }
        } else {
          await bot.sendMessage(chatId, phrases.wrongBirthDate);
        }
        break;
    }
  });
};

export default introduction;
