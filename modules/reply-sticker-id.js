import { bot } from "../app";

bot.on('sticker', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
  
    if (userId !== 429789892) {
      // Не відповідаємо, якщо це не адмін
      return;
    }
  
    const sticker = msg.sticker;
    if (sticker) {
      const fileId = sticker.file_id;
  
      bot.sendMessage(chatId, `🎯 file_id стікера:\n${fileId}`);
    }
  });