import {
  PrismaClient,
  PricingType,
  Role,
  Language,
  OrderStatus,
  PaymentProviderType,
  PaymentStatus,
} from "@prisma/client";
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

  const createdServices: Record<string, { id: string; price: number }> = {};
  for (const service of servicesData) {
    const record = await prisma.service.upsert({
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
    createdServices[service.slug] = { id: record.id, price: record.price };
  }

  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { phone: "+998900000000" },
    update: { role: Role.ADMIN },
    create: {
      phone: "+998900000000",
      firstName: "Lingo Bridge",
      lastName: "Admin",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      language: Language.UZ,
    },
  });

  const demoUserPasswordHash = await bcrypt.hash("User123!", 10);
  const demoUser = await prisma.user.upsert({
    where: { phone: "+998901112233" },
    update: {},
    create: {
      phone: "+998901112233",
      firstName: "Azizbek",
      lastName: "Karimov",
      passwordHash: demoUserPasswordHash,
      role: Role.USER,
      language: Language.UZ,
    },
  });

  // Seed realistic sample orders if database has none yet (for dashboard charts preview)
  const existingOrdersCount = await prisma.order.count();
  if (existingOrdersCount === 0) {
    const samples = [
      {
        orderNumber: "LB-1001",
        serviceSlug: "avtoreferat-tarjima",
        sourceLanguage: Language.UZ,
        targetLanguage: Language.EN,
        fileName: "PhD_Avtoreferat_2026.pdf",
        pageCount: 24,
        status: OrderStatus.COMPLETED,
      },
      {
        orderNumber: "LB-1002",
        serviceSlug: "avtoreferat-tarjima",
        sourceLanguage: Language.UZ,
        targetLanguage: Language.RU,
        fileName: "DSc_Abstract_Matematika.pdf",
        pageCount: 18,
        status: OrderStatus.COMPLETED,
      },
      {
        orderNumber: "LB-1003",
        serviceSlug: "dissertatsiya-tahrir",
        sourceLanguage: Language.RU,
        targetLanguage: Language.EN,
        fileName: "Dissertatsiya_Bob1_Bob2.docx",
        pageCount: 40,
        status: OrderStatus.IN_PROGRESS,
      },
      {
        orderNumber: "LB-1004",
        serviceSlug: "boshqa-hujjatlar-tarjimasi",
        sourceLanguage: Language.UZ,
        targetLanguage: Language.EN,
        fileName: "Diplom_va_Ilova.pdf",
        pageCount: 4,
        status: OrderStatus.PAID,
      },
      {
        orderNumber: "LB-1005",
        serviceSlug: "boshqa-hujjatlar-tarjimasi",
        sourceLanguage: Language.EN,
        targetLanguage: Language.UZ,
        fileName: "Ilmiy_Maqola_Scopus.pdf",
        pageCount: 12,
        status: OrderStatus.WAITING_PAYMENT,
      },
    ];

    for (const s of samples) {
      const svc = createdServices[s.serviceSlug];
      const totalPrice = svc.price * s.pageCount;
      const created = await prisma.order.create({
        data: {
          orderNumber: s.orderNumber,
          userId: demoUser.id,
          serviceId: svc.id,
          sourceLanguage: s.sourceLanguage,
          targetLanguage: s.targetLanguage,
          originalFileName: s.fileName,
          originalFileKey: `originals/sample/${s.fileName}`,
          pageCount: s.pageCount,
          autoDetectedPages: s.fileName.endsWith(".pdf"),
          unitPrice: svc.price,
          pricingType: PricingType.PER_PAGE,
          totalPrice,
          status: s.status,
          completedAt: s.status === OrderStatus.COMPLETED ? new Date() : null,
        },
      });

      if (s.status !== OrderStatus.WAITING_PAYMENT) {
        await prisma.payment.create({
          data: {
            orderId: created.id,
            userId: demoUser.id,
            provider: PaymentProviderType.CARD_TRANSFER,
            status:
              s.status === OrderStatus.IN_PROGRESS
                ? PaymentStatus.WAITING_VERIFICATION
                : PaymentStatus.SUCCEEDED,
            amount: totalPrice,
            paidAt: s.status === OrderStatus.COMPLETED || s.status === OrderStatus.PAID ? new Date() : null,
          },
        });
      }
    }
  }

  console.log("Seed completed successfully!");
  console.log("Default Admin: +998 90 000 00 00 / Admin123!");
  console.log("Demo User:     +998 90 111 22 33 / User123!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
