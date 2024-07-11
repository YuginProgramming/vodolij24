import axios from 'axios';
import moment from 'moment';
import { logger } from '../logger/index.js';

const getLogs = async (substract) => {
    const currentTime = moment();
    const endTime = currentTime.format('YYYY-MM-DD HH:mm:ss');
    const startTime = currentTime.subtract(substract, 'minutes').format('YYYY-MM-DD HH:mm:ss');

    const url = 'http://soliton.net.ua/water/api/LogTelegramBot.php'; // Replace with the actual URL
    const requestData = {
        ds: startTime,
        de: endTime
    };
            
    try {
        const response = await axios.post(url, requestData);

        console.log(response.data)
    } catch (error) {
        logger.warn(`Transaction reqest unknown error`)
    }
};

getLogs(1440);
            
export default getLogs       