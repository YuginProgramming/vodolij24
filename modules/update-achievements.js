import { bot } from "../app.js";
import { keyboards } from "../language_ua.js";
import { findAchievementById } from "../models/achievements.js";
import { createNewAchievement, findAchievementsByChatId } from "../models/user_achievements.js";

const updateAchievements = async (chatID) => {
    const achievements = await findAchievementsByChatId(chatID);
    if (achievements.length === 0) {
        await bot.sendMessage(chatID, 'Отримано досягнення', {
            parse_mode: "Markdown",
            disable_web_page_preview: true,
          });
        await createNewAchievement(chatID, 1);

        const achievement = await findAchievementById(1);

        const message = `
🏆 *${achievement.title}*

${achievement.description }

`.trim();

          

    await bot.sendMessage(chatID, message, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: {
        keyboard: keyboards.mainMenuButton,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });

    bot.sendSticker(chatID, achievement.icon)
        
    }
}

const showAchievements = async (chatID) => {
    const achievements = await findAchievementsByChatId(chatID);
    console.log(achievements)
        if (achievements.length === 0) {
            const achievement = await findAchievementById(1);

            const message = `
    🏆 *${achievement.title}*

${achievement.description }

    ${achievement.icon }
    `.trim();

        await bot.sendMessage(chatID, message, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        reply_markup: {
            keyboard: keyboards.transactionsNavigation,
            resize_keyboard: true,
            one_time_keyboard: true,
        },
        });
            
        } else {
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            await delay(1000); 

            bot.sendMessage(chatID, '*Отримано досягнень: *' + achievements.length,

                {
                    parse_mode: "Markdown",
                  }
            )

            for (const achievement of achievements) {
                const content = await findAchievementById(achievement.achievement_id);
                const message = `
        🏆 *${content.title}*
${content.description}
        
        `.trim();
        
                await bot.sendMessage(chatID, message, {
                parse_mode: "Markdown",
                disable_web_page_preview: true,
                });

                bot.sendSticker(chatID, content.icon,
                    {
                        reply_markup: {
                            keyboard: keyboards.transactionsNavigation,
                            resize_keyboard: true,
                            one_time_keyboard: true,
                        },
                    }
                );
            }
        
    }
}

export {
    updateAchievements,
    showAchievements
} 