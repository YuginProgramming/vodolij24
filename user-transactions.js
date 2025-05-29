import axios from 'axios';
import moment from 'moment';
import { createNewTransaction } from './models/transactions.js'
import { logger } from './logger/index.js';

const getUserTransactions = async (device, substract, cardId) => {

    const currentTime = moment();

    const endTime = currentTime.format('YYYY-MM-DD HH:mm:ss');
    const startTime = currentTime.subtract(substract, 'minutes').format('YYYY-MM-DD HH:mm:ss');

    console.log(startTime);
    console.log(endTime);

    const url = 'https://soliton.net.ua/water/api/water/index.php';
    
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
            const log = response.data?.log

            console.log(log)
            if (log.length > 0) {
                const lastTransaction = log.find(item => item.cardid == cardId);

                const transactionData = {
                    device,
                    date: lastTransaction.date,
                    waterRequested: lastTransaction.wz,
                    waterFullfilled: lastTransaction.wg,
                    cashPaymant: lastTransaction.mt,
                    cardPaymant: lastTransaction.mt_bn,
                    onlinePaymant: lastTransaction.mt_www,
                    paymantChange: lastTransaction.sd,
                    isAutorized: lastTransaction.logdelayed === 'Y' && true,
                    cardId: lastTransaction.cardid
                };
                //Тут ми записували транзакцію в реальному часі але це призводило до задвоювання данних в базі і відповідно статистиці. Поки потушим 
                //Але памятаємо про те що можна повернути данні в реальному часі що може бути корисно в багатьох речах
                //createNewTransaction(transactionData);

                return transactionData
            }
        }
    } catch (error) {
        logger.warn(`Transaction reqest unknown error ${error}`)
    }
};
export default getUserTransactions       