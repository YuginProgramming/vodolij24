import { findAllUsers } from "../../models/api-users.js";

const getWaterTotalbyTheDay = async (cardId) => {
    let res;
    
    const today = new Date();
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const todayString = today.toISOString().split('T')[0];
    
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    try {
        const totalWaterFulfilled = await Transaction.sum('waterFullfilled', {
            where: {

                cardId,

                date: {
                    [Op.between]: [yesterdayString, todayString]
                }

            }
        });

        return totalWaterFulfilled;
    
    } catch (err) {
        logger.error(`Impossible to request sum: ${err}`);
    }
    return res;
};


const botUsersStatistic = async () => {

    const users = await findAllUsers();

    const usersQuantity = users.lenght;

    for (let user of users) {
       const cardId = user?.cards;

       if (cardId) {
        const userTotal = await getWaterTotalbyTheDay(cardId);
       }

    }


}

export default botUsersStatistic;