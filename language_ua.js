import { generateKeyboard } from './src/plugins.js'

const phrases = {
    greetings: 'Доброго дня. Я бот Водолій, я допоможу Вам користуватися Автоматами Водолій ще зручніше та економічніше. Авторизуйтеся для доступу до функціоналу. Введіть, будь ласка, свій номер телефону у форматі +380ХХХХХХХХХ або скористайтеся кнопкою "Поділитися номером телефону"',
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
    welcomeHaveCard: `Дякуємо за авторизацію, тепер Вам доступні
    всі функції бота, а саме:
    - У Вас тепер є віртуальна картка Водолій, номер якої є номером вказаного Вами мобільного телефону. Цю картку можна поповнювати, нею можна розраховуватися, а також на неї будуть нараховуватися бонуси від всіх Ваших покупок як готівкових, так і безготівкових. Для цього перед покупкою оберіть бажану операцію через меню бота та виконуйте інструкції
    - Базовий бонус = 20% від придбаних літрів, але після обороту 1000 літрів він стане 25%, а після обороту 2000 літрів 30%
    - Ви можете знайти автомати за адресами або на мапі
    - Ви можете розрахуватися балансом картки, в тому числі бонусними літрами`,
    mainMenu: 
    `Головне меню: `,
    alreadyAuth: 'Ви вже авторизовані',
    logout: '🔑 Ви вийшли з акаунту.',
    wrongPhone: 'Невірний номер телефону. Будь ласка, введіть номер телефону ще раз:',
    wrongBirthDate:'Некоректна дата. Будь ласка, спробуйте ще раз:',
    phoneRules: 'Введіть ваш номер телефону без +. Лише цифри. І відправте повідомлення',
    nameRequest: `Введіть будь ласка свої Прізвище Ім'я По-батькові`,
    chooseVendor: 'Введіть номер автомата (як правило вказаний на наклейці в лівому верхньому куті фронтальної частини) або оберіть автомат за допомогою геолокації',
    litrRules: `Введіть ціле число від 1 до 100`,
    amountRules: `Введіть сумму на яку ви хочете купити води`,
    
    enterVendorNum: 'Будь ласка, введіть номер автомата.',
    vendorActivation: `Дочекайтеся поки на екрані з'явиться Напис "На балансі картки "Х" літрів і вносьте кошти. Якщо Ви наберете воду на меншу суму, ніж внесли, решта зарахується на баланс картки.`,
    bonusNotification: `Дякуємо! За цю покупку на картку нараховано х бонусних літрів`,
    countType: `В яких одиницях виміру хочете здійснити покупку?`,
    accountStatus: '💳 Рахунок',
    enterTopupAmount: 'Введіть сумму в грн, на яку хочете поповнити. На цю суму будуть нараховані бонуси згідно Вашого бонусного профілю',
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
    welcomeNoCard: 'Шановний клієнте, дякуємо за авторизацію. Ви вже можете користуватися всіма функціями бота окрім використання балансу з пластикової карти. Щоб баланс картки став доступний в боті, необхідно підтвердити фізичну наявність картки. Для підтвердження наявності у Вас картки з вказаним номером, коли наступного разу будете біля автомату "Водолій", натисніть в головному меню бота кнопку "Верифікувати картку" та виконайте інструкції.',
    pressStart: `Після виводу суми на екран автомата поставте тару та натисніть кнопку "Старт"`
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
    countType: [
      ['Ввести суму в літрах'],
      ['Ввести суму в грн'],
      ['Повернутися до головного меню']
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
    mainMenuButton: [
      ['Повернутися до головного меню'],
    ],
    paymantMethod: [
      ['Готівкою'],
      ['Картка Visa/Mastercard'],
      ['Балансом картки Водолій']
    ],
    mainMenu: generateKeyboard(2, [ [{ text: '⛽️ Купити воду' }], [{ text: '💸 Поповнити картку' }], [{ text: 'Знайти найближчий автомат', request_location: true, }], [{text: 'Мій профіль'}], [{text: 'Служба підтримки'}] ]),

    mainMenuWithVerify: generateKeyboard(2, [ [{text: 'Верифікувати картку'}], [{ text: '⛽️ Купити воду' }], [{ text: '💸 Поповнити картку' }], [{ text: 'Знайти найближчий автомат', request_location: true, }], [{text: 'Мій профіль'}], [{text: 'Служба підтримки'}] ]),

    login: [[{ text: 'Зареєструватись' }, { text: 'Авторизуватись' }]],
    chooseVendor: generateKeyboard(1, [[{ text: 'Знайти найближчий автомат по геолокації', request_location: true, }], [{text: 'Повернутися до головного меню'}]]),
    accountStatus: generateKeyboard(3,  [['💰 Баланс'], ['💸 Поповнити баланс'], ['⭐️ Бонуси'], ['📊 Історія операцій'], ['До головного меню']]),
    returnToBalance: [['💳 Рахунок']],
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
      [{ text: 'Обєм в літрах', callback_data: '/volume' } ],
      [{ text: 'Сумма в гривнях', callback_data: '/price' }]
    ]},
    isBonusCard: { 
      inline_keyboard: [
      [{ text: 'Так, маю', callback_data: '/mainHaveCard' } ],
      [{ text: 'Ні, не маю', callback_data: '/mainNoCard' }]
    ]},
};

export { phrases, keyboards }
