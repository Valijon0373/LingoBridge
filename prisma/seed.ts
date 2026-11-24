import { PrismaClient, PricingType, Role, Language } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Lingo Bridge database...");

  const servicesData = [
    {
      slug: "avtoreferat-tarjima",
      nameUz: "Avtoreferat tarjima",
      nameRu: "Перевод автореферата",
      nameEn: "Dissertation Abstract Translation",
      descriptionUz:
        "PhD va DSc dissertatsiya avtoreferatlarini akademik terminologiya va OAK talablariga muvofiq professional tarjima qilish.",
      descriptionRu:
        "Профессиональный перевод авторефератов диссертаций PhD и DSc в соответствии с академической терминологией и требованиями ВАК.",
      descriptionEn:
        "Professional translation of PhD and DSc dissertation abstracts aligned with academic terminology and official standards.",
      price: 30000,
      pricingType: PricingType.PER_PAGE,
      isActive: true,
      sortOrder: 1,
    },
    {
      slug: "dissertatsiya-tahrir",
      nameUz: "Dissertatsiyalarni tahrir qilish",
      nameRu: "Редактирование диссертаций",
      nameEn: "Dissertation Editing & Proofreading",
      descriptionUz:
        "Ilmiy ishlar va dissertatsiyalarni uslubiy, grammatik va akademik standartlar asosida chuqur tahrir va korrekturadan o‘tkazish.",
      descriptionRu:
        "Глубокое стилистическое, грамматическое и академическое редактирование и корректура научных работ и диссертаций.",
      descriptionEn:
        "Comprehensive stylistic, grammatical, and academic editing and proofreading for theses and scholarly dissertations.",
      price: 25000,
      pricingType: PricingType.PER_PAGE,
      isActive: true,
      sortOrder: 2,
    },
    {
      slug: "boshqa-hujjatlar-tarjimasi",
      nameUz: "Boshqa hujjatlar tarjimasi",
      nameRu: "Перевод других документов",
      nameEn: "Other Official Documents Translation",
      descriptionUz:
        "Diplom, ilova, shartnoma, maqola, sertifikat va boshqa rasmiy hamda shaxsiy hujjatlarni aniqlik bilan tarjima qilish.",
      descriptionRu:
        "Точный перевод дипломов, приложений, договоров, научных статей, сертификатов и других официальных документов.",
      descriptionEn:
        "Accurate translation of diplomas, transcripts, contracts, research articles, certificates, and official documents.",
      price: 30000,
      pricingType: PricingType.PER_PAGE,
      isActive: true,
      sortOrder: 3,
    },
  ];

  for (const service of servicesData) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        nameUz: service.nameUz,
        nameRu: service.nameRu,
        nameEn: service.nameEn,
        descriptionUz: service.descriptionUz,
        descriptionRu: service.descriptionRu,
        descriptionEn: service.descriptionEn,
        price: service.price,
        pricingType: service.pricingType,
        sortOrder: service.sortOrder,
      },
      create: service,
    });
  }

  const adminPasswordHash = await bcrypt.hash("LingoB2026!", 10);
  await prisma.user.upsert({
    where: { phone: "+998900000000" },
    update: { role: Role.ADMIN, username: "admin", passwordHash: adminPasswordHash },
    create: {
      username: "admin",
      phone: "+998900000000",
      firstName: "Lingo Bridge",
      lastName: "Admin",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      language: Language.UZ,
    },
  });

  const defaultSettings: Array<[string, string]> = [
    ["PAYMENT_CARD_NUMBER", process.env.PAYMENT_CARD_NUMBER || "8600 0000 0000 0000"],
    ["PAYMENT_CARD_HOLDER", process.env.PAYMENT_CARD_HOLDER || "LINGO BRIDGE MCHJ"],
    ["PAYMENT_CARD_BANK", process.env.PAYMENT_CARD_BANK || "Uzcard / Humo"],
    ["SUPPORT_PHONE", process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+998 90 123 45 67"],
    ["SUPPORT_TELEGRAM", process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM || "https://t.me/lingobridge_admin"],
    [
      "TELEGRAM_BOT_USERNAME",
      (process.env.TELEGRAM_BOT_USERNAME || "lingo_bridge_spin_bot").replace(/^@/, ""),
    ],
  ];

  for (const [key, value] of defaultSettings) {
    await prisma.appSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  console.log("Seed completed successfully!");
  console.log("Default Admin: admin / LingoB2026!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
