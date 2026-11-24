# Lingo Bridge Telegram Bot (`@lingo_bridge_spin_bot`)

Lingo Bridge veb-platformasi uchun alohida papkada joylashgan Telegram bot.

## Imkoniyatlari
1. **Ro‘yxatdan o‘tgan foydalanuvchini tanish (`/start`):**
   - Saytdagi **Kabinet → Profil → Telegram bot bilan bog‘lash** havolasi orqali (`/start link_<CODE>`) bir bosishda ulanadi.
   - Yoki botda to‘g‘ridan-to‘g‘ri `/start` bosib, **📱 Telefon raqamni ulashish** tugmasi orqali saytda ro‘yxatdan o‘tgan telefon raqami bo‘yicha avtomatik bog‘lanadi.
2. **Shaxsiy ma’lumotlar va statistika (`/profile`):**
   - F.I.Sh, telefon raqam, rol, til, ro‘yxatdan o‘tgan sana, jami/jarayondagi/tayyor buyurtmalar va sarflangan summa.
3. **Tayyor tarjima xabarnomasi va fayl yetkazish:**
   - Admin panelda tarjima fayli yuklanganda yoki buyurtma `COMPLETED` holatiga o‘tganda foydalanuvchiga avtomatik xabar va tayyor fayl yuboriladi.
   - Istalgan vaqtda `✅ Tayyor tarjimalar` (`/ready`) bo‘limidan tayyor fayllarni qayta yuklab olish mumkin.

## Ishga tushirish

```bash
cd telegram-bot
npm start
```

Development (avto-qayta yuklanish) rejimi:

```bash
cd telegram-bot
npm run dev
```
