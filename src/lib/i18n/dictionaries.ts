import type { Locale } from "@/lib/utils";

export interface Dictionary {
  common: {
    brand: string;
    tagline: string;
    home: string;
    services: string;
    calculator: string;
    howItWorks: string;
    faq: string;
    orderNow: string;
    myOrders: string;
    dashboard: string;
    adminPanel: string;
    login: string;
    register: string;
    logout: string;
    profile: string;
    save: string;
    cancel: string;
    back: string;
    next: string;
    loading: string;
    perPage: string;
    fixedPrice: string;
    pages: string;
    download: string;
    view: string;
    copy: string;
    copied: string;
    select: string;
    search: string;
    all: string;
    close: string;
    submit: string;
  };
  statuses: {
    PENDING: string;
    WAITING_PAYMENT: string;
    PAID: string;
    IN_PROGRESS: string;
    COMPLETED: string;
    CANCELLED: string;
    REFUNDED: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    trust1: string;
    trust2: string;
    trust3: string;
    stat1Label: string;
    stat2Label: string;
    stat3Label: string;
  };
  landing: {
    servicesTitle: string;
    servicesSubtitle: string;
    calcTitle: string;
    calcSubtitle: string;
    calcService: string;
    calcDirection: string;
    calcPages: string;
    calcEstimated: string;
    calcStartOrder: string;
    calcFixedNote: string;
    stepsTitle: string;
    stepsSubtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    contactTitle: string;
    contactSubtitle: string;
    phoneLabel: string;
    telegramLabel: string;
    botLabel: string;
    faqTitle: string;
    faqs: Array<{ q: string; a: string }>;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    loginHint: string;
    registerTitle: string;
    registerSubtitle: string;
    registerHint: string;
    overlayLoginTitle: string;
    overlayLoginSubtitle: string;
    overlayRegisterTitle: string;
    overlayRegisterSubtitle: string;
    passwordHint: string;
    phone: string;
    firstName: string;
    lastName: string;
    password: string;
    language: string;
    loginButton: string;
    registerButton: string;
    noAccount: string;
    haveAccount: string;
  };
  orderWizard: {
    title: string;
    subtitle: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
    chooseService: string;
    chooseDirection: string;
    uploadTitle: string;
    uploadHint: string;
    allowedFormats: string;
    detectingPages: string;
    detectedPagesBadge: string;
    manualPagesLabel: string;
    fixedPagesNote: string;
    noteLabel: string;
    notePlaceholder: string;
    summaryTitle: string;
    orderNumber: string;
    service: string;
    direction: string;
    document: string;
    pageCount: string;
    unitPrice: string;
    totalPrice: string;
    serverPriceNote: string;
    createOrderBtn: string;
    paymentTitle: string;
    cardMethod: string;
    cardMethodDesc: string;
    cardNumber: string;
    cardHolder: string;
    uploadReceiptLabel: string;
    uploadReceiptBtn: string;
    receiptSuccess: string;
    onlineMethods: string;
    mockPayBtn: string;
    mockPayDesc: string;
    payWithClick: string;
    payWithPayme: string;
    gatewayNotConfigured: string;
    goToOrders: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    tabOrders: string;
    tabProfile: string;
    tabNotifications: string;
    totalOrders: string;
    totalSpent: string;
    completedOrders: string;
    newOrderBtn: string;
    noOrders: string;
    noOrdersDesc: string;
    originalDoc: string;
    receiptDoc: string;
    translatedDoc: string;
    downloadTranslation: string;
    payNow: string;
    profileTitle: string;
    profileSaved: string;
    telegramSectionTitle: string;
    telegramSectionDesc: string;
    telegramConnected: string;
    telegramConnectBtn: string;
    telegramOpenBot: string;
    notificationsEmpty: string;
    markAllRead: string;
  };
  admin: {
    title: string;
    subtitle: string;
    navOverview: string;
    navOrders: string;
    navServices: string;
    navBroadcast: string;
    navAudit: string;
    navTelegram: string;
    totalUsers: string;
    totalOrders: string;
    totalRevenue: string;
    completedOrders: string;
    statusDistribution: string;
    exportExcel: string;
    searchOrdersPlaceholder: string;
    attachTranslation: string;
    attachTranslationHint: string;
    uploadTranslationBtn: string;
    updateStatus: string;
    adminNote: string;
    addService: string;
    editService: string;
    active: string;
    inactive: string;
    broadcastTitle: string;
    broadcastSubtitle: string;
    broadcastSubject: string;
    broadcastMessage: string;
    broadcastTelegram: string;
    sendBroadcastBtn: string;
    auditTitle: string;
    telegramTitle: string;
    telegramSubtitle: string;
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  uz: {
    common: {
      brand: "Lingo Bridge",
      tagline: "Akademik va rasmiy hujjatlar tarjimasi",
      home: "Bosh sahifa",
      services: "Xizmatlar",
      calculator: "Kalkulyator",
      howItWorks: "Qanday ishlaydi",
      faq: "Savol-javob",
      orderNow: "Buyurtma berish",
      myOrders: "Mening buyurtmalarim",
      dashboard: "Kabinet",
      adminPanel: "Admin Panel",
      login: "Kirish",
      register: "Ro‘yxatdan o‘tish",
      logout: "Chiqish",
      profile: "Profil",
      save: "Saqlash",
      cancel: "Bekor qilish",
      back: "Orqaga",
      next: "Keyingi",
      loading: "Yuklanmoqda...",
      perPage: "sahifa",
      fixedPrice: "qat’iy narx",
      pages: "sahifa",
      download: "Yuklab olish",
      view: "Ko‘rish",
      copy: "Nusxalash",
      copied: "Nusxalandi!",
      select: "Tanlash",
      search: "Qidirish",
      all: "Barchasi",
      close: "Yopish",
      submit: "Yuborish",
    },
    statuses: {
      PENDING: "Kutilmoqda",
      WAITING_PAYMENT: "To‘lov kutilmoqda",
      PAID: "To‘langan",
      IN_PROGRESS: "Jarayonda",
      COMPLETED: "Tugallangan",
      CANCELLED: "Bekor qilingan",
      REFUNDED: "Qaytarilgan",
    },
    hero: {
      badge: "Akademik va rasmiy hujjatlar tarjima markazi",
      title: "Avtoreferat, dissertatsiya va rasmiy hujjatlarning ishonchli tarjimasi",
      subtitle:
        "Hujjatingizni onlayn yuklang — tizim PDF sahifalarini avtomatik hisoblaydi, aniq narxni ko‘rsatadi va tayyor tarjimani shaxsiy kabinetingiz hamda Telegram bot orqali yetkazib beradi.",
      primaryCta: "Buyurtma berish",
      secondaryCta: "Narxni hisoblash",
      trust1: "PDF sahifalarini avtomatik sanash",
      trust2: "OAK va akademik standartlarga muvofiq",
      trust3: "Telegram bot orqali tezkor bildirishnoma",
      stat1Label: "Tarjima yo‘nalishlari",
      stat2Label: "Onlayn buyurtma qabul qilish",
      stat3Label: "Maxfiylik kafolati",
    },
    landing: {
      servicesTitle: "Xizmatlar va narxlar",
      servicesSubtitle:
        "Barcha narxlar shaffof va oldindan aniq hisoblanadi. Kerakli xizmatni tanlab darhol buyurtma bering.",
      calcTitle: "Interaktiv narx kalkulyatori",
      calcSubtitle:
        "Xizmat turi, tarjima yo‘nalishi va sahifalar sonini kiriting — taxminiy narxni darhol bilib oling.",
      calcService: "Xizmat turi",
      calcDirection: "Tarjima yo‘nalishi",
      calcPages: "Sahifalar soni",
      calcEstimated: "Taxminiy jami narx",
      calcStartOrder: "Shu parametrlar bilan buyurtma berish",
      calcFixedNote: "Ushbu xizmat uchun qat’iy narx amal qiladi.",
      stepsTitle: "Qanday ishlaydi?",
      stepsSubtitle: "Atigi 4 oddiy qadamda professional tarjimaga ega bo‘ling",
      step1Title: "1. Xizmatni tanlang",
      step1Desc: "Avtoreferat, dissertatsiya tahriri yoki rasmiy hujjat tarjimasini va til yo‘nalishini belgilang.",
      step2Title: "2. Hujjatni yuklang",
      step2Desc: "PDF, DOCX yoki rasm yuklang. PDF fayllar sahifalari soni avtomatik aniqlanadi.",
      step3Title: "3. To‘lovni amalga oshiring",
      step3Desc: "Karta orqali chek yuklang yoki onlayn to‘lov (Click / Payme) orqali tasdiqlang.",
      step4Title: "4. Tayyor tarjimani oling",
      step4Desc: "Tarjima tayyor bo‘lgach, kabinetingizdan va Telegram botdan bir bosishda yuklab oling.",
      contactTitle: "Yordam va Aloqa",
      contactSubtitle: "Savollaringiz bormi? Mutaxassislarimiz sizga yordam berishga tayyor.",
      phoneLabel: "Telefon raqam",
      telegramLabel: "Telegram Admin",
      botLabel: "Telegram Bot",
      faqTitle: "Ko‘p beriladigan savollar",
      faqs: [
        {
          q: "PDF hujjat sahifalari qanday hisoblanadi?",
          a: "PDF faylni yuklaganingizda serverimiz fayldagi sahifalar sonini avtomatik o‘qiydi va narxni aniq hisoblab beradi. DOC, DOCX va rasmlar uchun sahifalar sonini o‘zingiz kiritasiz.",
        },
        {
          q: "To‘lov qanday usullarda qabul qilinadi?",
          a: "Uzcard/Humo kartasiga o‘tkazma qilib chekni yuklashingiz yoki integratsiya qilingan Click / Payme tizimlari orqali to‘lov qilishingiz mumkin.",
        },
        {
          q: "Tayyor tarjimani qayerdan yuklab olaman?",
          a: "Buyurtma tugallangach (COMPLETED), tayyor fayl «Mening buyurtmalarim» bo‘limida paydo bo‘ladi va Telegram botingizga ham avtomatik yuboriladi.",
        },
        {
          q: "Telegram bot orqali tarjimam tayyor bo‘lganini qanday bilaman?",
          a: "Ro‘yxatdan o‘tganingizdan so‘ng @lingo_bridge_spin_bot botiga kirib /start bosing va telefon raqamingizni ulashing (yoki shaxsiy kabinetdagi «Profil → Telegram bot bilan bog‘lash» tugmasidan foydalaning). Shundan so‘ng botda o‘zingiz va buyurtmalaringiz haqida ma’lumot ko‘rishingiz, tarjimangiz tayyor bo‘lishi bilan esa avtomatik xabar hamda tayyor faylni to‘g‘ridan-to‘g‘ri Telegramda qabul qilishingiz mumkin.",
        },
        {
          q: "Hujjatlarim maxfiyligi ta’minlanadimi?",
          a: "Ha, barcha yuklangan ilmiy va rasmiy hujjatlar himoyalangan serverda saqlanadi va faqat siz hamda mas’ul tarjimon/admin ko‘rishi mumkin.",
        },
      ],
    },
    auth: {
      loginTitle: "Tizimga kirish",
      loginSubtitle: "Buyurtmalaringizni kuzatish va yangi buyurtma berish uchun kiring",
      loginHint: "Telefon raqamingiz va parolingizdan foydalaning",
      registerTitle: "Ro‘yxatdan o‘tish",
      registerSubtitle: "Lingo Bridge platformasida shaxsiy kabinet yarating",
      registerHint: "Ro‘yxatdan o‘tish uchun ma’lumotlaringizni kiriting",
      overlayLoginTitle: "Xush kelibsiz!",
      overlayLoginSubtitle: "Allaqachon hisobingiz bormi? Buyurtmalaringizni kuzatish uchun tizimga kiring",
      overlayRegisterTitle: "Salom, Foydalanuvchi!",
      overlayRegisterSubtitle: "Shaxsiy ma’lumotlaringiz bilan ro‘yxatdan o‘ting va barcha imkoniyatlardan foydalaning",
      passwordHint: "Parol (kamida 6 ta belgi)",
      phone: "Telefon raqam",
      firstName: "Ism",
      lastName: "Familiya",
      password: "Parol",
      language: "Interfeys tili",
      loginButton: "Kirish",
      registerButton: "Ro‘yxatdan o‘tish",
      noAccount: "Hisobingiz yo‘qmi?",
      haveAccount: "Allaqachon ro‘yxatdan o‘tganmisiz?",
    },
    orderWizard: {
      title: "Yangi buyurtma yaratish",
      subtitle: "Hujjatingizni yuklang va aniq narxni darhol oling",
      step1: "Xizmat",
      step2: "Yo‘nalish",
      step3: "Hujjat",
      step4: "Xulosa",
      step5: "To‘lov",
      chooseService: "Tarjima xizmatini tanlang",
      chooseDirection: "Tarjima yo‘nalishini tanlang",
      uploadTitle: "Hujjatni yuklang",
      uploadHint: "Faylni bu yerga sudrab tashlang yoki kompyuterdan tanlang",
      allowedFormats: "Ruxsat etilgan formatlar: PDF, DOC, DOCX, JPG, JPEG, PNG (maks. 25 MB)",
      detectingPages: "PDF sahifalari aniqlanmoqda...",
      detectedPagesBadge: "PDF sahifalari avtomatik aniqlandi",
      manualPagesLabel: "Sahifalar sonini kiriting",
      fixedPagesNote: "Bu xizmat qat’iy narxda (FIXED) — sahifalar soni avtomatik 1 qilib olinadi.",
      noteLabel: "Qo‘shimcha izoh (ixtiyoriy)",
      notePlaceholder: "Masalan: OAK talablari, muddat yoki maxsus atamalar...",
      summaryTitle: "Buyurtma xulosasi",
      orderNumber: "Buyurtma raqami",
      service: "Xizmat",
      direction: "Yo‘nalish",
      document: "Hujjat",
      pageCount: "Sahifalar soni",
      unitPrice: "Birlik narxi",
      totalPrice: "Jami to‘lov summasi",
      serverPriceNote: "Narx xavfsizlik maqsadida faqat server tomonda hisoblanadi.",
      createOrderBtn: "Buyurtmani tasdiqlash va to‘lovga o‘tish",
      paymentTitle: "To‘lovni amalga oshiring",
      cardMethod: "Karta orqali o‘tkazma + Chek yuklash",
      cardMethodDesc: "Quyidagi kartaga to‘lovni o‘tkazing va chek skrinshoti yoki PDF faylini yuklang.",
      cardNumber: "Karta raqami",
      cardHolder: "Karta egasi",
      uploadReceiptLabel: "To‘lov chekini yuklang (JPG, PNG, PDF)",
      uploadReceiptBtn: "Chekni yuborish",
      receiptSuccess: "Chek muvaffaqiyatli yuklandi! Buyurtmangiz tekshirish va tarjima jarayoniga o‘tkazildi.",
      onlineMethods: "Onlayn to‘lov tizimlari",
      mockPayBtn: "Test to‘lovini amalga oshirish (Mock)",
      mockPayDesc: "Sinov rejimi: buyurtmani darhol PAID holatiga o‘tkazadi.",
      payWithClick: "Click orqali to‘lash",
      payWithPayme: "Payme orqali to‘lash",
      gatewayNotConfigured: "Hozircha test/sozlanmagan",
      goToOrders: "Mening buyurtmalarimga o‘tish",
    },
    dashboard: {
      title: "Shaxsiy kabinet",
      subtitle: "Buyurtmalaringiz holatini kuzating va tayyor tarjimalarni yuklab oling",
      tabOrders: "Buyurtmalarim",
      tabProfile: "Profil",
      tabNotifications: "Bildirishnomalar",
      totalOrders: "Jami buyurtmalar",
      totalSpent: "Jami sarflangan summa",
      completedOrders: "Tugallanganlar",
      newOrderBtn: "Yangi buyurtma",
      noOrders: "Hozircha buyurtmalaringiz yo‘q",
      noOrdersDesc: "Birinchi akademik yoki rasmiy hujjat tarjimangizga hoziroq buyurtma bering.",
      originalDoc: "Asl hujjat",
      receiptDoc: "To‘lov cheki",
      translatedDoc: "Tayyor tarjima",
      downloadTranslation: "Tayyor tarjimani yuklab olish",
      payNow: "To‘lov qilish",
      profileTitle: "Profil ma’lumotlari",
      profileSaved: "Profil ma’lumotlari saqlandi!",
      telegramSectionTitle: "Telegram Bot integratsiyasi",
      telegramSectionDesc:
        "Telegram hisobingizni bog‘lang va buyurtma holati o‘zgarganda hamda tayyor tarjima yuklanganda darhol Telegram orqali xabar va fayl oling.",
      telegramConnected: "Telegram botga ulangan",
      telegramConnectBtn: "Telegram bot bilan bog‘lash",
      telegramOpenBot: "Telegram botda ochish",
      notificationsEmpty: "Yangi bildirishnomalar yo‘q",
      markAllRead: "Barchasini o‘qilgan deb belgilash",
    },
    admin: {
      title: "Admin boshqaruv paneli",
      subtitle: "Buyurtmalar, xizmatlar, tushum va Telegram bot boshqaruvi",
      navOverview: "Statistika",
      navOrders: "Buyurtmalar",
      navServices: "Xizmatlar",
      navBroadcast: "Xabarnoma",
      navAudit: "Audit jurnali",
      navTelegram: "Telegram Bot",
      totalUsers: "Jami foydalanuvchilar",
      totalOrders: "Jami buyurtmalar",
      totalRevenue: "Umumiy tushum",
      completedOrders: "Tugallangan buyurtmalar",
      statusDistribution: "Holatlar bo‘yicha buyurtmalar",
      exportExcel: "Excel (.xlsx) eksport",
      searchOrdersPlaceholder: "Buyurtma raqami (#LB-...), ism yoki telefon...",
      attachTranslation: "Tayyor tarjima faylini biriktirish",
      attachTranslationHint: "Fayl yuklanganda buyurtma avtomatik COMPLETED bo‘ladi va mijozga xabar ketadi.",
      uploadTranslationBtn: "Faylni yuklash va yakunlash",
      updateStatus: "Holatni yangilash",
      adminNote: "Admin izohi",
      addService: "Yangi xizmat qo‘shish",
      editService: "Xizmatni tahrirlash",
      active: "Faol",
      inactive: "Nofaol",
      broadcastTitle: "Barcha foydalanuvchilarga xabarnoma (Broadcast)",
      broadcastSubtitle: "E’lon barcha mijozlarning veb-kabinetiga va ulangan Telegram bot foydalanuvchilariga yuboriladi.",
      broadcastSubject: "Sarlavha",
      broadcastMessage: "Xabar matni",
      broadcastTelegram: "Telegram bot orqali ham yuborish",
      sendBroadcastBtn: "Xabarnomani yuborish",
      auditTitle: "Admin harakatlari jurnali (Audit Log)",
      telegramTitle: "Telegram Bot Integratsiyasi",
      telegramSubtitle: "Bot holati, webhook sozlamalari va admin bildirishnomalari",
    },
  },
  ru: {
    common: {
      brand: "Lingo Bridge",
      tagline: "Перевод академических и официальных документов",
      home: "Главная",
      services: "Услуги",
      calculator: "Калькулятор",
      howItWorks: "Как это работает",
      faq: "Вопросы и ответы",
      orderNow: "Оформить заказ",
      myOrders: "Мои заказы",
      dashboard: "Кабинет",
      adminPanel: "Админ-панель",
      login: "Войти",
      register: "Регистрация",
      logout: "Выйти",
      profile: "Профиль",
      save: "Сохранить",
      cancel: "Отмена",
      back: "Назад",
      next: "Далее",
      loading: "Загрузка...",
      perPage: "стр.",
      fixedPrice: "фикс. цена",
      pages: "стр.",
      download: "Скачать",
      view: "Просмотр",
      copy: "Копировать",
      copied: "Скопировано!",
      select: "Выбрать",
      search: "Поиск",
      all: "Все",
      close: "Закрыть",
      submit: "Отправить",
    },
    statuses: {
      PENDING: "Ожидает",
      WAITING_PAYMENT: "Ожидает оплаты",
      PAID: "Оплачен",
      IN_PROGRESS: "В работе",
      COMPLETED: "Завершён",
      CANCELLED: "Отменён",
      REFUNDED: "Возврат",
    },
    hero: {
      badge: "Центр академического и официального перевода",
      title: "Надёжный перевод авторефератов, диссертаций и официальных документов",
      subtitle:
        "Загрузите документ онлайн — система автоматически подсчитает страницы PDF, рассчитает точную стоимость и доставит готовый перевод в личный кабинет и Telegram-бот.",
      primaryCta: "Оформить заказ",
      secondaryCta: "Рассчитать стоимость",
      trust1: "Автоподсчёт страниц PDF",
      trust2: "Соответствие стандартам ВАК",
      trust3: "Уведомления и файлы в Telegram-боте",
      stat1Label: "Языковых направлений",
      stat2Label: "Онлайн-приём заказов",
      stat3Label: "Конфиденциальность",
    },
    landing: {
      servicesTitle: "Услуги и тарифы",
      servicesSubtitle:
        "Прозрачные цены с точным расчётом до оплаты. Выберите нужную услугу и оформите заказ онлайн.",
      calcTitle: "Интерактивный калькулятор стоимости",
      calcSubtitle:
        "Выберите услугу, направление перевода и количество страниц для мгновенного расчёта.",
      calcService: "Тип услуги",
      calcDirection: "Направление перевода",
      calcPages: "Количество страниц",
      calcEstimated: "Ориентировочная стоимость",
      calcStartOrder: "Оформить заказ с этими параметрами",
      calcFixedNote: "Для данной услуги действует фиксированная цена.",
      stepsTitle: "Как это работает?",
      stepsSubtitle: "Всего 4 простых шага до готового профессионального перевода",
      step1Title: "1. Выберите услугу",
      step1Desc: "Укажите вид документа и языковое направление перевода.",
      step2Title: "2. Загрузите документ",
      step2Desc: "Загрузите PDF, DOCX или изображение. Страницы PDF определяются автоматически.",
      step3Title: "3. Оплатите заказ",
      step3Desc: "Переведите на карту и загрузите чек либо оплатите онлайн через Click / Payme.",
      step4Title: "4. Скачайте готовый перевод",
      step4Desc: "Получите готовый файл в личном кабинете и напрямую в Telegram-боте.",
      contactTitle: "Поддержка и контакты",
      contactSubtitle: "Остались вопросы? Наша команда всегда на связи.",
      phoneLabel: "Телефон",
      telegramLabel: "Telegram Админ",
      botLabel: "Telegram Бот",
      faqTitle: "Часто задаваемые вопросы",
      faqs: [
        {
          q: "Как подсчитывается количество страниц PDF?",
          a: "При загрузке PDF наш сервер автоматически определяет точное количество страниц. Для DOC, DOCX и изображений вы указываете количество страниц вручную.",
        },
        {
          q: "Какие способы оплаты доступны?",
          a: "Доступен перевод на карту Uzcard/Humo с загрузкой чека, а также модульная оплата через Click и Payme.",
        },
        {
          q: "Где скачать готовый перевод?",
          a: "После завершения работы (COMPLETED) файл появится в разделе «Мои заказы» и автоматически придёт в привязанный Telegram-бот.",
        },
        {
          q: "Как узнать через Telegram-бот, что мой перевод готов?",
          a: "После регистрации откройте @lingo_bridge_spin_bot, нажмите /start и поделитесь номером телефона (или привяжите аккаунт через «Профиль → Привязать Telegram-бот» в личном кабинете). После этого вы сможете просматривать свои данные и заказы в боте, а как только перевод будет готов, автоматически получите уведомление и готовый файл прямо в Telegram.",
        },
        {
          q: "Гарантируется ли конфиденциальность документов?",
          a: "Да, все файлы хранятся в защищённом хранилище с доступом только для владельца заказа и администратора.",
        },
      ],
    },
    auth: {
      loginTitle: "Вход в систему",
      loginSubtitle: "Войдите, чтобы отслеживать заказы и оформлять новые переводы",
      loginHint: "Используйте номер телефона и пароль",
      registerTitle: "Регистрация",
      registerSubtitle: "Создайте личный кабинет на платформе Lingo Bridge",
      registerHint: "Введите данные для создания аккаунта",
      overlayLoginTitle: "С возвращением!",
      overlayLoginSubtitle: "Уже есть аккаунт? Войдите, чтобы отслеживать свои заказы и переводы",
      overlayRegisterTitle: "Привет, пользователь!",
      overlayRegisterSubtitle: "Зарегистрируйтесь, чтобы пользоваться всеми возможностями платформы",
      passwordHint: "Пароль (минимум 6 символов)",
      phone: "Номер телефона",
      firstName: "Имя",
      lastName: "Фамилия",
      password: "Пароль",
      language: "Язык интерфейса",
      loginButton: "Войти",
      registerButton: "Зарегистрироваться",
      noAccount: "Нет аккаунта?",
      haveAccount: "Уже зарегистрированы?",
    },
    orderWizard: {
      title: "Оформление нового заказа",
      subtitle: "Загрузите документ и получите точный расчёт стоимости",
      step1: "Услуга",
      step2: "Направление",
      step3: "Документ",
      step4: "Итог",
      step5: "Оплата",
      chooseService: "Выберите услугу",
      chooseDirection: "Выберите направление перевода",
      uploadTitle: "Загрузите документ",
      uploadHint: "Перетащите файл сюда или выберите с устройства",
      allowedFormats: "Допустимые форматы: PDF, DOC, DOCX, JPG, JPEG, PNG (макс. 25 МБ)",
      detectingPages: "Определяем количество страниц PDF...",
      detectedPagesBadge: "Страницы PDF определены автоматически",
      manualPagesLabel: "Укажите количество страниц",
      fixedPagesNote: "Фиксированный тариф (FIXED) — количество страниц автоматически равно 1.",
      noteLabel: "Комментарий к заказу (необязательно)",
      notePlaceholder: "Например: требования к терминам или желаемый срок...",
      summaryTitle: "Сводка заказа",
      orderNumber: "Номер заказа",
      service: "Услуга",
      direction: "Направление",
      document: "Документ",
      pageCount: "Количество страниц",
      unitPrice: "Цена за единицу",
      totalPrice: "Итого к оплате",
      serverPriceNote: "Стоимость рассчитывается строго на сервере для безопасности.",
      createOrderBtn: "Подтвердить заказ и перейти к оплате",
      paymentTitle: "Оплата заказа",
      cardMethod: "Перевод на карту + Загрузка чека",
      cardMethodDesc: "Переведите сумму на указанную карту и загрузите скриншот или PDF чека.",
      cardNumber: "Номер карты",
      cardHolder: "Получатель",
      uploadReceiptLabel: "Загрузите чек оплаты (JPG, PNG, PDF)",
      uploadReceiptBtn: "Отправить чек",
      receiptSuccess: "Чек успешно загружен! Заказ переведён в статус проверки и выполнения.",
      onlineMethods: "Онлайн-оплата",
      mockPayBtn: "Тестовая оплата (Mock)",
      mockPayDesc: "Режим тестирования: мгновенно переводит заказ в статус PAID.",
      payWithClick: "Оплатить через Click",
      payWithPayme: "Оплатить через Payme",
      gatewayNotConfigured: "Требует ключей в .env",
      goToOrders: "Перейти к моим заказам",
    },
    dashboard: {
      title: "Личный кабинет",
      subtitle: "Отслеживайте статус заказов и скачивайте готовые переводы",
      tabOrders: "Мои заказы",
      tabProfile: "Профиль",
      tabNotifications: "Уведомления",
      totalOrders: "Всего заказов",
      totalSpent: "Всего оплачено",
      completedOrders: "Завершено",
      newOrderBtn: "Новый заказ",
      noOrders: "У вас пока нет заказов",
      noOrdersDesc: "Оформите свой первый заказ на академический или официальный перевод.",
      originalDoc: "Исходный файл",
      receiptDoc: "Чек оплаты",
      translatedDoc: "Готовый перевод",
      downloadTranslation: "Скачать готовый перевод",
      payNow: "Оплатить",
      profileTitle: "Данные профиля",
      profileSaved: "Профиль обновлён!",
      telegramSectionTitle: "Интеграция с Telegram-ботом",
      telegramSectionDesc:
        "Привяжите Telegram, чтобы мгновенно получать уведомления о статусе заказа и готовые файлы переводов прямо в боте.",
      telegramConnected: "Привязан к Telegram-боту",
      telegramConnectBtn: "Привязать Telegram-бот",
      telegramOpenBot: "Открыть в Telegram",
      notificationsEmpty: "Новых уведомлений нет",
      markAllRead: "Отметить все как прочитанные",
    },
    admin: {
      title: "Панель администратора",
      subtitle: "Управление заказами, услугами, аналитикой и Telegram-ботом",
      navOverview: "Статистика",
      navOrders: "Заказы",
      navServices: "Услуги",
      navBroadcast: "Рассылка",
      navAudit: "Журнал аудита",
      navTelegram: "Telegram Бот",
      totalUsers: "Всего пользователей",
      totalOrders: "Всего заказов",
      totalRevenue: "Общая выручка",
      completedOrders: "Завершённые заказы",
      statusDistribution: "Заказы по статусам",
      exportExcel: "Экспорт в Excel (.xlsx)",
      searchOrdersPlaceholder: "Номер заказа (#LB-...), имя или телефон...",
      attachTranslation: "Прикрепить готовый перевод",
      attachTranslationHint: "После загрузки файла заказ автоматически получит статус COMPLETED, а клиент получит уведомление.",
      uploadTranslationBtn: "Загрузить и завершить",
      updateStatus: "Обновить статус",
      adminNote: "Заметка администратора",
      addService: "Добавить услугу",
      editService: "Редактировать услугу",
      active: "Активна",
      inactive: "Неактивна",
      broadcastTitle: "Массовая рассылка (Broadcast)",
      broadcastSubtitle: "Сообщение будет отправлено в личные кабинеты всех пользователей и в привязанный Telegram-бот.",
      broadcastSubject: "Заголовок",
      broadcastMessage: "Текст сообщения",
      broadcastTelegram: "Также отправить в Telegram-бот",
      sendBroadcastBtn: "Отправить рассылку",
      auditTitle: "Журнал действий администраторов (Audit Log)",
      telegramTitle: "Интеграция Telegram-бота",
      telegramSubtitle: "Состояние бота, настройка Webhook и уведомления администраторов",
    },
  },
  en: {
    common: {
      brand: "Lingo Bridge",
      tagline: "Academic & Official Document Translation",
      home: "Home",
      services: "Services",
      calculator: "Calculator",
      howItWorks: "How It Works",
      faq: "FAQ",
      orderNow: "Place Order",
      myOrders: "My Orders",
      dashboard: "Dashboard",
      adminPanel: "Admin Panel",
      login: "Sign In",
      register: "Sign Up",
      logout: "Sign Out",
      profile: "Profile",
      save: "Save",
      cancel: "Cancel",
      back: "Back",
      next: "Next",
      loading: "Loading...",
      perPage: "page",
      fixedPrice: "fixed price",
      pages: "pages",
      download: "Download",
      view: "View",
      copy: "Copy",
      copied: "Copied!",
      select: "Select",
      search: "Search",
      all: "All",
      close: "Close",
      submit: "Submit",
    },
    statuses: {
      PENDING: "Pending",
      WAITING_PAYMENT: "Waiting Payment",
      PAID: "Paid",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      REFUNDED: "Refunded",
    },
    hero: {
      badge: "Academic & Official Translation Platform",
      title: "Trusted Translation for Abstracts, Dissertations & Official Documents",
      subtitle:
        "Upload your document online — our server automatically counts PDF pages, computes transparent pricing, and delivers your completed translation to your dashboard and Telegram bot.",
      primaryCta: "Place an Order",
      secondaryCta: "Estimate Price",
      trust1: "Automatic PDF page counting",
      trust2: "Academic & institutional precision",
      trust3: "Instant Telegram bot notifications",
      stat1Label: "Language pairs",
      stat2Label: "Online ordering",
      stat3Label: "Confidentiality",
    },
    landing: {
      servicesTitle: "Services & Pricing",
      servicesSubtitle:
        "Transparent per-page and fixed rates loaded live from our catalog. Choose a service to begin.",
      calcTitle: "Interactive Price Calculator",
      calcSubtitle:
        "Pick a service, translation direction, and page count to see your estimated cost immediately.",
      calcService: "Service Type",
      calcDirection: "Translation Direction",
      calcPages: "Number of Pages",
      calcEstimated: "Estimated Total",
      calcStartOrder: "Continue with These Options",
      calcFixedNote: "This service uses a flat fixed rate.",
      stepsTitle: "How It Works",
      stepsSubtitle: "Get your professional translation in 4 streamlined steps",
      step1Title: "1. Select Service",
      step1Desc: "Pick the academic or official document service and language pair.",
      step2Title: "2. Upload Document",
      step2Desc: "Upload PDF, DOCX, or images. PDF page counts are detected automatically.",
      step3Title: "3. Make Payment",
      step3Desc: "Pay via bank card with receipt upload or online via Click / Payme.",
      step4Title: "4. Download Translation",
      step4Desc: "Download your completed file from your dashboard or directly via Telegram bot.",
      contactTitle: "Support & Contact",
      contactSubtitle: "Have questions? Our specialists are ready to help.",
      phoneLabel: "Phone",
      telegramLabel: "Telegram Admin",
      botLabel: "Telegram Bot",
      faqTitle: "Frequently Asked Questions",
      faqs: [
        {
          q: "How are PDF pages counted?",
          a: "When you upload a PDF, our server inspects the document and automatically counts pages. For DOC, DOCX, and images, you enter the page count manually.",
        },
        {
          q: "Which payment methods are supported?",
          a: "You can transfer to our Uzcard/Humo card and upload the receipt, or pay via modular Click / Payme gateways.",
        },
        {
          q: "Where do I download the finished translation?",
          a: "Once marked COMPLETED, your translated file appears in My Orders and is sent automatically to your linked Telegram bot.",
        },
        {
          q: "How do I get notified via Telegram bot when my translation is ready?",
          a: "After registering, open @lingo_bridge_spin_bot, press /start, and share your phone number (or connect via «Profile → Connect Telegram Bot» in your dashboard). You can then view your profile and orders in the bot, and as soon as your translation is ready, you will automatically receive a notification along with the finished file directly in Telegram.",
        },
        {
          q: "Are my documents kept confidential?",
          a: "Yes. All files are stored securely with strict access control — only you and authorized staff can access them.",
        },
      ],
    },
    auth: {
      loginTitle: "Sign In",
      loginSubtitle: "Access your orders, invoices, and completed translations",
      loginHint: "Use your phone number and password",
      registerTitle: "Create Account",
      registerSubtitle: "Register on Lingo Bridge in seconds",
      registerHint: "Enter your personal details to register",
      overlayLoginTitle: "Welcome Back!",
      overlayLoginSubtitle: "Enter your personal details to use all of Lingo Bridge features",
      overlayRegisterTitle: "Hello, User!",
      overlayRegisterSubtitle: "Register with your personal details to use all of site features",
      passwordHint: "Password (at least 6 characters)",
      phone: "Phone Number",
      firstName: "First Name",
      lastName: "Last Name",
      password: "Password",
      language: "Interface Language",
      loginButton: "Sign In",
      registerButton: "Sign Up",
      noAccount: "Don’t have an account?",
      haveAccount: "Already have an account?",
    },
    orderWizard: {
      title: "Create New Order",
      subtitle: "Upload your document and receive an instant server-verified quote",
      step1: "Service",
      step2: "Direction",
      step3: "Upload",
      step4: "Summary",
      step5: "Payment",
      chooseService: "Choose a translation service",
      chooseDirection: "Choose translation direction",
      uploadTitle: "Upload your document",
      uploadHint: "Drag and drop your file here, or click to browse",
      allowedFormats: "Allowed formats: PDF, DOC, DOCX, JPG, JPEG, PNG (max 25 MB)",
      detectingPages: "Counting PDF pages on server...",
      detectedPagesBadge: "PDF pages automatically detected",
      manualPagesLabel: "Enter number of pages",
      fixedPagesNote: "Fixed-price service — page count is automatically set to 1.",
      noteLabel: "Additional notes (optional)",
      notePlaceholder: "e.g., preferred academic terminology or deadline...",
      summaryTitle: "Order Summary",
      orderNumber: "Order Number",
      service: "Service",
      direction: "Direction",
      document: "Document",
      pageCount: "Pages",
      unitPrice: "Unit Price",
      totalPrice: "Total Amount",
      serverPriceNote: "Final totals are calculated exclusively on the server.",
      createOrderBtn: "Confirm Order & Proceed to Payment",
      paymentTitle: "Complete Payment",
      cardMethod: "Bank Card Transfer + Receipt Upload",
      cardMethodDesc: "Transfer the total amount to the card below and upload your receipt image or PDF.",
      cardNumber: "Card Number",
      cardHolder: "Card Holder",
      uploadReceiptLabel: "Upload payment receipt (JPG, PNG, PDF)",
      uploadReceiptBtn: "Submit Receipt",
      receiptSuccess: "Receipt uploaded! Your order is now IN_PROGRESS for verification and translation.",
      onlineMethods: "Online Payment Gateways",
      mockPayBtn: "Complete Test Payment (Mock)",
      mockPayDesc: "Sandbox mode: immediately marks this order as PAID.",
      payWithClick: "Pay with Click",
      payWithPayme: "Pay with Payme",
      gatewayNotConfigured: "Requires .env credentials",
      goToOrders: "Go to My Orders",
    },
    dashboard: {
      title: "Client Dashboard",
      subtitle: "Track order progress and download finished translations",
      tabOrders: "My Orders",
      tabProfile: "Profile",
      tabNotifications: "Notifications",
      totalOrders: "Total Orders",
      totalSpent: "Total Spent",
      completedOrders: "Completed",
      newOrderBtn: "New Order",
      noOrders: "No orders yet",
      noOrdersDesc: "Place your first academic or official document translation order now.",
      originalDoc: "Original File",
      receiptDoc: "Payment Receipt",
      translatedDoc: "Translated File",
      downloadTranslation: "Download Translation",
      payNow: "Pay Now",
      profileTitle: "Profile Details",
      profileSaved: "Profile updated successfully!",
      telegramSectionTitle: "Telegram Bot Integration",
      telegramSectionDesc:
        "Link your Telegram account to receive instant status alerts and completed translation files directly in Telegram.",
      telegramConnected: "Connected to Telegram Bot",
      telegramConnectBtn: "Connect Telegram Bot",
      telegramOpenBot: "Open in Telegram",
      notificationsEmpty: "No notifications yet",
      markAllRead: "Mark all as read",
    },
    admin: {
      title: "Admin Dashboard",
      subtitle: "Manage orders, services, revenue analytics, and Telegram bot",
      navOverview: "Analytics",
      navOrders: "Orders",
      navServices: "Services",
      navBroadcast: "Broadcast",
      navAudit: "Audit Log",
      navTelegram: "Telegram Bot",
      totalUsers: "Total Users",
      totalOrders: "Total Orders",
      totalRevenue: "Total Revenue",
      completedOrders: "Completed Orders",
      statusDistribution: "Orders by Status",
      exportExcel: "Export Excel (.xlsx)",
      searchOrdersPlaceholder: "Order #LB-..., client name, or phone...",
      attachTranslation: "Attach Finished Translation",
      attachTranslationHint: "Uploading marks the order COMPLETED and notifies the client automatically.",
      uploadTranslationBtn: "Upload & Complete Order",
      updateStatus: "Update Status",
      adminNote: "Admin Note",
      addService: "Add Service",
      editService: "Edit Service",
      active: "Active",
      inactive: "Inactive",
      broadcastTitle: "Broadcast Announcement",
      broadcastSubtitle: "Deliver announcements to all clients in-app and via linked Telegram accounts.",
      broadcastSubject: "Subject",
      broadcastMessage: "Message",
      broadcastTelegram: "Also deliver via Telegram Bot",
      sendBroadcastBtn: "Send Broadcast",
      auditTitle: "Admin Audit Log",
      telegramTitle: "Telegram Bot Integration",
      telegramSubtitle: "Bot connection health, webhook configuration, and admin notifications",
    },
  },
};

export function getServiceLocalizedName(
  service: { nameUz: string; nameRu: string; nameEn: string },
  locale: Locale
): string {
  if (locale === "ru") return service.nameRu;
  if (locale === "en") return service.nameEn;
  return service.nameUz;
}

export function getServiceLocalizedDescription(
  service: { descriptionUz: string; descriptionRu: string; descriptionEn: string },
  locale: Locale
): string {
  if (locale === "ru") return service.descriptionRu;
  if (locale === "en") return service.descriptionEn;
  return service.descriptionUz;
}
