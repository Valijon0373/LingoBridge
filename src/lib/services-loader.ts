import { prisma } from "./prisma";
import type { ServiceDTO } from "@/types";

export const FALLBACK_SERVICES: ServiceDTO[] = [
  {
    id: "seed-avtoreferat",
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
    pricingType: "PER_PAGE",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "seed-dissertatsiya",
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
    pricingType: "PER_PAGE",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "seed-boshqa",
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
    pricingType: "PER_PAGE",
    isActive: true,
    sortOrder: 3,
  },
];

export async function getActiveServicesSafe(): Promise<ServiceDTO[]> {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    if (services.length > 0) {
      return services;
    }
    return FALLBACK_SERVICES;
  } catch {
    return FALLBACK_SERVICES;
  }
}
