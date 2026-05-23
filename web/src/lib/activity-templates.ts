import type { ActivityType } from "@/types/models";

export const ACTIVITY_TEMPLATES: {
  activityType: ActivityType;
  label: string;
  content: string;
}[] = [
  {
    activityType: "phone_call",
    label: "Telefon görüşmesi",
    content: "Telefon görüşmesi yapıldı.",
  },
  {
    activityType: "whatsapp",
    label: "WhatsApp",
    content: "WhatsApp mesajı gönderildi.",
  },
  {
    activityType: "email",
    label: "E-posta",
    content: "E-posta gönderildi.",
  },
  {
    activityType: "note",
    label: "2 gün sonra ara",
    content: "2 gün sonra tekrar aranacak.",
  },
  {
    activityType: "payment_request",
    label: "Ödeme linki",
    content: "Ödeme linki paylaşıldı.",
  },
];
