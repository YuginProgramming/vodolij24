import { bot } from "./app.js";
import axios from 'axios';
import { dataBot } from './values.js';
import fs from 'fs';
import jsQR from 'jsqr';
import Jimp from 'jimp';


export const decodeQR = () => {
    bot.on('photo', async (msg) => {
        const chatId = msg.chat.id;
        try {
          const photoId = msg.photo[msg.photo.length - 1].file_id;
          const photoInfo = await bot.getFile(photoId);
          const photoUrl = `https://api.telegram.org/file/bot${dataBot.telegramBotToken}/${photoInfo.file_path}`;
          const photoPath = `./photos/${photoId}.jpg`;
          await downloadFile(photoUrl, photoPath);
          const qrText = await readQRCode(photoPath);
          bot.sendMessage(chatId, `Розшифроване число з QR-коду: ${qrText}`);
          fs.unlinkSync(photoPath);
        } catch (error) {
          console.error('Помилка обробки фото:', error);
        }
      });

      //
      const downloadFile = async (url, destinationPath) => {
        const response = await axios({
          method: 'GET',
          url,
          responseType: 'stream',
        });
      
        response.data.pipe(fs.createWriteStream(destinationPath));
      
        return new Promise((resolve, reject) => {
          response.data.on('end', () => {
            resolve();
          });
      
          response.data.on('error', (err) => {
            reject(err);
          });
        });
      };
      
      async function readQRCode(photoPath) {
        const image = await Jimp.read(photoPath);
        const width = image.bitmap.width;
        const height = image.bitmap.height;
        const pixels = jsQR(image.bitmap.data, width, height);
        if (pixels && pixels.data) {
          const qrText = pixels.data;
          return qrText;
        } else {
          throw new Error('QR-код не знайдений');
        }
      }

      // Обробка помилок
      process.on('unhandledRejection', (error) => {
        console.error('Unhandled promise rejection:', error);
      });
      
}
