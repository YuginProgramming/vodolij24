import { generateKeyboard } from './src/plugins.js'

const phrases = {
    greetings: 'Доброго дня. Я бот Водолій, я допоможу Вам користуватися Автоматами Водолій ще зручніше та економічніше. Авторизуйтеся для доступу до функціоналу, для цього скористайтеся кнопкою "Поділитися номером телефону" внизу екрана"',
    nameRequest: '`Введіть дату народження у форматі ДД.ММ.РРРР`',
    dataConfirmation: (customerName, customerPhone) => {
        return `Ваш номер телефону: ${customerPhone}. Ваше імя ${customerName}. Дані вірні?`;
    },
    thanksForOrder: (customerName) => {
        return `Замовлення успішно оформлено. Дякую ${customerName}`;
    },
    bonusCardQuestion: 'Чи Ви маєте діючу бонусну картку Водолій?',
    congratAuth: '🎉 Ви успішно авторизувались.', 
    congratRegister: '🎉 Ви успішно зареєструвались та авторизувались.',
    welcomeHaveCard: `Шановний клієнте, дякуємо за авторизацію. Ви вже можете користуватися всіма функціями бота окрім використання балансу з пластикової карти. Щоб баланс картки став доступний в боті, необхідно підтвердити фізичну наявність картки. Для підтвердження наявності у Вас картки з вказаним номером, коли наступного разу будете біля автомату "Водолій", натисніть в головному меню бота кнопку "Верифікувати картку" та виконайте інструкції.`,
    welcomeNoCard: `Дякуємо за авторизацію, тепер Вам доступні
    всі функції бота, а саме:
    - У Вас тепер є віртуальна картка Водолій, номер якої є номером вказаного Вами мобільного телефону. Цю картку можна поповнювати, нею можна розраховуватися, а також на неї будуть нараховуватися бонуси від всіх Ваших покупок як готівкових, так і безготівкових. Для цього перед покупкою оберіть бажану операцію через меню бота та виконуйте інструкції
    - Базовий бонус = 20% від придбаних літрів, але після обороту 1000 літрів він стане 25%, а після обороту 2000 літрів 30%
    - Ви можете знайти автомати за адресами або на мапі
    - Ви можете розрахуватися балансом картки, в тому числі бонусними літрами
    `,
    mainMenu: 
    `Головне меню: `,
    alreadyAuth: 'Ви вже авторизовані',
    logout: '🔑 Ви вийшли з акаунту.',
    wrongPhone: 'Невірний номер телефону. Будь ласка, введіть номер телефону ще раз:',
    wrongBirthDate:'Некоректна дата. Будь ласка, спробуйте ще раз:',
    phoneRules: 'Введіть ваш номер телефону без +. Лише цифри. І відправте повідомлення',
    nameRequest: `Введіть будь ласка свої Прізвище Ім'я По-батькові`,
    chooseVendor: 'Введіть номер автомата (як правило вказаний на наклейці в правому або лівому верхньому куті фронтальної частини) або оберіть автомат за допомогою геолокації',
    litrRules: `Введіть ціле число від 1 до 100`,
    amountRules: `Введіть сумму на яку ви хочете купити води`,
    
    enterVendorNum: 'Будь ласка, введіть номер автомата.',
    vendorActivation: `Дочекайтеся появи на екрані автомату напису: "Картка: ХХ-ХХ-ХХ-ХХ, літрів ХХ", і тоді вносьте кошти. Якщо після набору води в автоматі буде залишок коштів, натисніть 4 рази кнопку "Стоп/пауза" та залишок буде зараховано на Ваш баланс"`,
    useCard: `Дочекайтеся поки на екрані з'явиться Напис "На балансі картки "Х" літрів. І виберіть на автоматі об’єм який бажаєте налити. `,
    bonusNotification: `Дякуємо! За цю покупку на картку нараховано х бонусних літрів`,
    bonusNotificationCard: (litersChange, litersPrice, bonusLiters, waterPrice, total) => {
      return `Внесено: ${litersPrice} грн, куплено: ${litersChange} літра за ціною ${waterPrice} грн/літр + бонус ${bonusLiters} літра= ${total} л разом 💧`;
    },
    bonusNotificationCardError: `Оплата не пройшла, бонуси не нараховано. Якщо при цьому Ви внесли оплату, зв'яжіться будь ласка зі службою підтримки за номером телефону +380975148884 (працює Пн-Пт з 8:00 до 22:00, Сб-Нд з 9:00 до 20:00) для нарахування бонусів`,
    countType: `В яких одиницях виміру хочете здійснити покупку?`,
    accountStatus: '💳 Рахунок',
    choosePaymantWay: 'Оберіть спосіб оплати',
    userHistory: '📊 Історія операцій',
    chooseVolume: `👉 Виберіть потрібну кількість літрів продукту.  ✏️ Або напишіть об’єм продукту у літрах цілим числом чи з дробною частиною.`,
    chooseAmount: '👉 Виберіть потрібну сумму у грн на яку бажаєте придбати продукт. ✏️ Або напишіть суму покупки у гривнях цілим числом чи з дробною частиною.',
    userBonusAcc: `💫 Ваші бонуси при обороті/n✅ 0 БОНУСНИХ грн /n20% від поповнення/n
    ↗️ 1000 БОНУСНИХ грн 30% від поповнення
    ↗️ 2000 БОНУСНИХ грн 30% від поповнення
    ↗️ 3000 БОНУСНИХ грн 30% від поповнення
    ↗️ 4000 БОНУСНИХ грн 30% від поповнення
    🌟 Додаткові бонуси: 
    За поповнення онлайн: 5% від поповнення
    За поповнення QR кодом: 5% від поповнення
    `,
    wrongNumber: `Потрібно ввести дійсне число. Спробуйте ще раз`,
    selectGoods: 'Виберіть будь ласка продукт із доступних:',
    volumeOrPrice: 'Виберіть будь ласка як саме ви хочете вказати кількість продукту:',
    registerRequest: 'Будь ласка, зареєструйтесь для доступу до функціоналу бота',
    welcomeNoCard: 'Шановний клієнте, дякуємо за авторизацію. Ви вже можете користуватися всіма функціями бота.',
    pressStart: `Після виводу суми на екран автомата поставте тару та натисніть кнопку "Старт"`,
    orderFromBalanceInstruction: `Дочекайтеся, поки на екрані автомату з'явиться обраний літраж, поставте тару та набирайте воду`,
    lowBalance: `Балансу не достатньо`,
    amountFromBalance: 'Введіть суму в літрах',
    verifyRules: 'Для верифікації картки Вам необхідно підійти до автомату і натиснути кнопку "Продовжити верифікацію"',
    readCard: `Прикладіть будь ласка картку до зчитувача, дочекайтеся поки на екрані з'явіиться напис "На балансі картки Х літрів", а потім натисніть кнопку картку зчитано`,
    successVerify: `Дякуємо, карту верифіковано, Тепер баланс за карткою буде відображатися в боті, а також Ви можете використовувати як пластикову картку, так і бота для поповнення, покупки води, нарахування бонусних літрів`,
    failVerify: `Нажаль верифікувати картку
    не вдалося. Спробуйте будь 
    ласка пізніше або зателефонуйте
    на службу підтримки `,
    chooseVendorRefil: `Для поповнення картки готівкою потрібно підійти до будь-якого автомату Водолій та виконати подальші інструкції бота. Введіть номер автомата (як правило вказаний на наклейці в лівому або правому верхньому куті фронтальної частини) або оберіть автомат за допомогою геолокації`,
    cardRefilCard: (cardNumber) => {
      return     `Поповнення картки номер "${cardNumber}". Оберіть будь ласка бажану суму літрів або гривень для поповнення балансу. Баланс картки завжди в літрах, тому в момент поповнення на Вашу картку буде зарахована кількість літрів за ціною 2 грн 00 копійок за 1 літр + бонус від 20 до 30% згідно з бонусною ставкою Вашої картки `;
    },
    refilInfo: `Інформація про нараховані бонуси буде повідомлення невдовзі після оплати`,
    readCardRefil: `Дочекайтеся, коли на екрані автомату з'явиться напис: "Картка: ХХ-ХХ-ХХ-ХХ, літрів ХХ", і тоді внесіть готівкові кошти. Після внесення бажаної суми натисніть на автоматі 4 рази кнопку "Стоп/пауза", на екрані перестане відображатися напис про баланс картки. При цьому на Вашу картку буде зараховано літри відповідно до ціни в цьому автоматі + бонус згідно бонусного профілю Вашої картки. Актуальний баланс на картці Ви завжди можете перевірити за допомогою цього бота`,
    cashRequest: `Внесіть бажану суму поповнення купюрами або монетами, а після внесення бажаної суми натисніть "Стоп" 4 рази підряд`,
    activationError: `Трапилась помилка при активації вашої карти на автоматі. Спробуйте ще раз або звяжіться з підтримкою`
  };
  
const keyboards = {
    contactRequest: [
      [ { text: 'Поділитися номером', request_contact: true, }]
    ],
    dataConfirmation: [
      ['Так, Оформити замовлення'],
      ['Ні, повторити введення'],
      ['/start'],
    ],
    lowBalance: [
      ['Поповнити баланс картки'],
      ['Вибрати інший спосіб оплати'],
      ['🏠 Повернутися до головного меню']
    ],
    countType: [
      ['Ввести суму в літрах'],
      ['Ввести суму в грн'],
      ['🏠 Повернутися до головного меню']
    ],
    litrRules: [
      [ { text: '5' }, { text: '6' } ],
      [ { text: '12' }, { text: '19' } ],
      ['Повернутися до головного меню']
    ],
    binarKeys: [
      ['Так'],
      ['Ні'],
    ],
    readCardRefil: [
      [`на екрані автомату з'явився напис: "на балансі картки х літрів"`],
      [`Пройшло понад 30 секунд, але напис на екрані автомату так і не з'явився`],
      ['🏠 Повернутися до головного меню']
    ],
    mainMenuButton: [
      ['🏠 Повернутися до головного меню'],
    ],
    paymantMethod: [
      ['🚰 Балансом картки Водолій'],
      ['💳 Картка Visa/Mastercard'],
      ['💸 Готівкою'],     
      
    ],
    paymantMethodFavorite: [
      ['🚰 Балансом картки Водолій'],
      ['💳 Картка Visa/Mastercard'],
      ['💸 Готівкою'],     
      ['🔄 Змінити автомат'],
    ],
    mainMenu: generateKeyboard(2, [ [{ text: '⛽️ Купити воду' }], [{ text: '💸 Поповнити картку' }], [{ text: '🧭 Знайти найближчий автомат', request_location: true, }], [{text: '👤 Мій профіль'}], [{text: '💬 Служба підтримки'}] ]),


    chooseVendor: generateKeyboard(1, [[{ text: '🧭 Знайти найближчий автомат по геолокації', request_location: true, }], [{text: '🏠 Повернутися до головного меню'}]]),
    accountStatus: generateKeyboard(3,  [['💰 Баланс'], ['💸 Поповнити баланс'], ['⭐️ Бонуси'], ['📊 Історія операцій'], ['До головного меню']]),
    choosePaymantWay: [
    ['💸 Готівка'],
    ['💳 Картка Visa/Mastercard'],
    ['🏠 Повернутися до головного меню']
  ],
    historyMenu: [['Остання операція за рахунком'], ['💳 Рахунок']],
    volumeKeyboard: { 
      inline_keyboard: [
      [{ text: '1', callback_data: 'volume-1' }, { text: '5', callback_data: 'volume-5' }, { text: '6', callback_data: 'volume-6' }],
      [{ text: '10', callback_data: 'volume-10' }, { text: '12', callback_data: 'volume-12' }, { text: '19', callback_data: 'volume-19' }]
    ]},
    amountKeyboard: { 
      inline_keyboard: [
      [{ text: '2', callback_data: 'volume-2' }, { text: '5', callback_data: 'volume-5' }, { text: '10', callback_data: 'volume-10' }],
      [{ text: '15', callback_data: 'volume-15' }, { text: '20', callback_data: 'volume-20' }, { text: '30', callback_data: 'volume-30' }]
    ]},
    twoWaters: { 
      inline_keyboard: [
      [{ text: 'Питна вода - 1.5 грн/л', callback_data: '/water' } ],
      [{ text: 'Мінералізована вода - 2.0 грн/л', callback_data: '/richedwater' }]
    ]},
    volumeOrPrice: { 
      inline_keyboard: [
      [{ text: "Об'єм в літрах", callback_data: '/volume' } ],
      [{ text: 'Сумма в гривнях', callback_data: '/price' }]
    ]},
    isBonusCard: { 
      inline_keyboard: [
      [{ text: 'Так, маю', callback_data: '/mainHaveCard' } ],
      [{ text: 'Ні, не маю', callback_data: '/mainNoCard' }]
    ]},
};

export { phrases, keyboards }

