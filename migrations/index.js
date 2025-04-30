import { User, createNewUser } from '../models/users.js';
import { logger } from '../logger/index.js';
import { Transaction } from '../models/transactions.js';
import { Apiuser, createNewApiUser } from '../models/api-users.js';
import { Card } from '../models/cards.js';
import { Achievements } from '../models/achievements.js';
import { UserAchievements } from '../models/user_achievements.js';

const DEBUG = true;

const main = async () => {
    try {
        const syncState = await Promise.all([
            User.sync(),
            Transaction.sync(),
            Apiuser.sync(),
            Card.sync(),
            Achievements.sync(),
            UserAchievements.sync()
        ]);
        
        
        if (DEBUG && syncState) {
            const pseudoRandom = () => Math.floor(Math.random() * 10000);
            const userData = {
                chat_id: pseudoRandom(),
                firstname: 'migration_record',
                phone: pseudoRandom().toString(),
                dialoguestatus: '',
            };

            logger.info('Log created by migration procedure');
            createNewUser(userData);
        }

    } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
    }
};

main();
