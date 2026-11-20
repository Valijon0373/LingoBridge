# Lingo Bridge — Akademik va Rasmiy Hujjatlar Tarjima Platformasi

**Lingo Bridge** — avtoreferat, dissertatsiya va boshqa rasmiy hujjatlarni onlayn qabul qilish, PDF sahifalarini avtomatik aniqlash, server tomonda narx hisoblash, to‘lovlarni qabul qilish va tayyor tarjimalarni veb-kabinet hamda Telegram bot orqali yetkazib berish tizimi.

## Asosiy imkoniyatlar
- **3 tilda to‘liq interfeys (i18n):** 🇺🇿 O‘zbek (`uz`), 🇷🇺 Rus (`ru`), 🇬🇧 Ingliz (`en`)
- **Dinamik xizmatlar katalogi (`PER_PAGE` / `FIXED`):** Avtoreferat tarjima, Dissertatsiya tahriri, Boshqa hujjatlar tarjimasi
- **6 ta tarjima yo‘nalishi:** UZ ↔ RU, UZ ↔ EN, RU ↔ EN
- **Multi-step Buyurtma Wizardi:** Drag & Drop yuklash, serverda **avtomatik PDF sahifa sanash** (`pdf-lib`), faqat serverda narx hisoblash
- **Modulli to‘lov tizimi (`src/lib/payments/`):**
  - Karta orqali o‘tkazma + chek yuklash (`IN_PROGRESS` + Telegram admin bildirishnoma)
  - Onlayn shlyuzlar: **Click**, **Payme**, va test rejimi uchun **Mock**
- **Ajratilgan Dashboard komponentlari:**
  - Mijoz kabineti: `src/components/dashboard/`
  - Admin panel (`/admin`): `src/components/admin/`
- **Admin Panel (`/admin`):** Statistika va grafiklar, buyurtmalarni qidirish/filtrlash, tayyor tarjima yuklash (avtomatik `COMPLETED`), xizmatlar CRUD, **Excel (.xlsx)** eksport (`exceljs`), Broadcast va Audit Log
- **Telegram Bot integratsiyasi (`src/lib/telegram/` + `src/bot/polling.ts`):**
  - Yangi buyurtma va cheklar adminga inline tugmalar bilan yuboriladi (`✅ PAID`, `⏳ IN_PROGRESS`, `❌ CANCELLED`)
  - Tayyor tarjima yuklanganda mijozning bog‘langan Telegram hisobiga hujjat to‘g‘ridan-to‘g‘ri yuboriladi
  - Mijoz Profil sahifasidan 1 bosishda `/start link_<CODE>` orqali hisobini botga bog‘laydi

## Ishga tushirish

1. `.env.example` faylidan `.env` yarating va PostgreSQL `DATABASE_URL` hamda boshqa kalitlarni to‘ldiring:
```bash
cp .env.example .env
```

2. Kutubxonalarni o‘rnating va Prisma bazasini tayyorlang:
```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

3. Veb-ilovani ishga tushiring:
```bash
npm run dev
```

4. (Ixtiyoriy) Lokal rejimda Telegram botni sinab ko‘rish uchun (alohida terminalda):
```bash
npm run bot:dev
```
Production muhitida Admin Panel -> **Telegram Bot** bo‘limi orqali webhook (`https://yourdomain.uz/api/telegram/webhook`) o‘rnatishingiz mumkin.

## Boshlang‘ich Seed hisoblar (`prisma/seed.ts`)
- **Admin:** `+998 90 000 00 00` / `Admin123!`
- **Demo Mijoz:** `+998 90 111 22 33` / `User123!`
