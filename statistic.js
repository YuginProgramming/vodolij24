import axios from 'axios';
import moment from 'moment';
import { createNewTransaction, getWaterTotalbyTheDay } from './models/transactions.js'
import { logger } from './logger/index.js';

function getCurrentDateFormatted() {
    const today = new Date();
    
    // Отримуємо день з додаванням нуля, якщо він одноцифровий
    const day = String(today.getDate()).padStart(2, '0');
    
    // Отримуємо місяць з додаванням нуля, якщо він одноцифровий
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Отримуємо рік
    const year = today.getFullYear();
    
    // Формуємо дату у форматі 'DD.MM.YYYY'
    const formattedDate = `${day}.${month}.${year}`;
    
    return formattedDate;
}




const getTransactions = async (device, substract) => {
    console.log(device)
    const currentTime = moment();
    const endTime = currentTime.format('YYYY-MM-DD HH:mm:ss');
    const startTime = currentTime.subtract(substract, 'minutes').format('YYYY-MM-DD HH:mm:ss');

    const url = 'https://soliton.net.ua/water/api/water/index.php'; // Replace with the actual URL
    const requestData = {
        device_id: device,
        ds: startTime,
        de: endTime
    };
            
    try {
        const response = await axios.post(url, requestData);
              
        if (response.data.status === 'error') {
            if (response.data.descr === 'date invalid') {
                logger.warn('Неправильна дата:', endTime, startTime);
            }
            if (response.data.descr === 'device invalid') {
                logger.warn('Неправильний апарат:', device);
            }                  
        }

        if (response.data.status === 'success') {
            if (response.data?.log === undefined) return;
            const log = response.data?.log;
            if (log.length > 0) {
                for (let transaction of log) {
                    const transactionData = {
                        device,
                        date: transaction.date,
                        waterRequested: transaction.wz,
                        waterFullfilled: transaction.wg,
                        cashPaymant: transaction.mt,
                        cardPaymant: transaction.mt_bn,
                        onlinePaymant: transaction.mt_www,
                        paymantChange: transaction.sd,
                        isAutorized: transaction.logdelayed === 'Y' && true,
                        cardId: transaction.cardid
                    };
    
                    await createNewTransaction(transactionData);    
                }
            }
        }
    } catch (error) {
        logger.warn(`Transaction reqest unknown error ${error}`)
    }
};

const getStatistic = async () => {
    const locations = await axios.get('http://soliton.net.ua/water/api/devices');
    const devices = locations.data.devices;
    const devicesQuantity = devices.length - 4;
    for (let i = 4; i < devices.length; i++) {
        await getTransactions(devices[i].id, 1440);
        if (i === devices.length - 1) {
            const sum = await getWaterTotalbyTheDay();
            const today = getCurrentDateFormatted();
            const string = `${today}
                Мережа Водолій налічує  автоматів  ${devicesQuantity},
                Кількість налитої води за добу: ${sum} літрів.`; 
            logger.info(string);
        }
    }    
};

getStatistic();

export default getStatistic;


