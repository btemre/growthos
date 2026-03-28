export const USER_ROLES = [
  "admin",
  "education_sales",
  "business_dev",
  "operations",
  "mentor",
] as const;

export const LEAD_TYPES = [
  "education_candidate",
  "corporate_customer",
  "partnership",
  "sponsor",
  "freelancer",
] as const;

export const LEAD_SOURCES = [
  "instagram",
  "whatsapp",
  "web_form",
  "event",
  "referral",
  "linkedin",
  "phone",
  "university_community",
  "in_person",
  "ad_campaign",
] as const;

export const EDUCATION_STAGES = [
  "new_application",
  "awaiting_first_contact",
  "discussed",
  "suitable_candidate",
  "undecided_followup",
  "awaiting_payment",
  "enrolled",
  "dropped",
  "not_suitable",
] as const;

export const CORPORATE_DEAL_STAGES = [
  "potential_company",
  "first_contact",
  "needs_analysis",
  "meeting_scheduled",
  "meeting_done",
  "proposal_prep",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
  "on_hold",
] as const;

export const TASK_TYPES = [
  "call",
  "message",
  "meeting",
  "send_proposal",
  "check_payment",
  "request_document",
  "demo",
  "follow_up",
] as const;

export const ACTIVITY_TYPES = [
  "phone_call",
  "whatsapp",
  "email",
  "meeting",
  "note",
  "proposal_sent",
  "payment_request",
  "contract_sent",
] as const;

export const PROGRAM_TYPES = [
  "bootcamp",
  "advanced_lab",
  "mentorship",
  "project_team",
  "other",
] as const;

export const PROGRAM_STATUSES = [
  "draft",
  "open",
  "ongoing",
  "completed",
  "cancelled",
] as const;

export const PAYMENT_STATUSES = [
  "unpaid",
  "partial",
  "paid",
  "refunded",
  "waived",
] as const;

export const PROPOSAL_STATUSES = [
  "draft",
  "prepared",
  "sent",
  "revision_requested",
  "accepted",
  "rejected",
] as const;

export const SERVICE_TYPES = [
  "software_dev",
  "website",
  "custom_web_app",
  "ai_chatbot",
  "automation",
  "digital_media",
  "it_consulting",
  "api_integration",
  "maintenance",
  "hosting",
  "brand_landing",
] as const;

export const LABELS = {
  role: {
    admin: "Yönetici",
    education_sales: "Eğitim Satış",
    business_dev: "İş Geliştirme",
    operations: "Operasyon",
    mentor: "Eğitmen / Mentor",
  },
  leadType: {
    education_candidate: "Eğitim Adayı",
    corporate_customer: "Kurumsal Müşteri",
    partnership: "Partner / İş Birliği",
    sponsor: "Sponsor / Yatırımcı",
    freelancer: "Freelancer / Ekip Adayı",
  },
  source: {
    instagram: "Instagram",
    whatsapp: "WhatsApp",
    web_form: "Web formu",
    event: "Etkinlik",
    referral: "Referans",
    linkedin: "LinkedIn",
    phone: "Telefon",
    university_community: "Üniversite topluluğu",
    in_person: "Yüz yüze",
    ad_campaign: "Reklam kampanyası",
  },
  educationStage: {
    new_application: "Yeni Başvuru",
    awaiting_first_contact: "İlk Temas Bekliyor",
    discussed: "Görüşüldü",
    suitable_candidate: "Uygun Aday",
    undecided_followup: "Kararsız / Takipte",
    awaiting_payment: "Ödeme Bekliyor",
    enrolled: "Kayıt Oldu",
    dropped: "Vazgeçti",
    not_suitable: "Uygun Değil",
  },
  dealStage: {
    potential_company: "Potansiyel Firma",
    first_contact: "İlk Temas",
    needs_analysis: "İhtiyaç Analizi",
    meeting_scheduled: "Toplantı Planlandı",
    meeting_done: "Toplantı Yapıldı",
    proposal_prep: "Teklif Hazırlanıyor",
    proposal_sent: "Teklif Gönderildi",
    negotiation: "Müzakere",
    won: "Kazanıldı",
    lost: "Kaybedildi",
    on_hold: "Beklemede",
  },
  taskType: {
    call: "Ara",
    message: "Yaz",
    meeting: "Toplantı yap",
    send_proposal: "Teklif gönder",
    check_payment: "Ödeme kontrol et",
    request_document: "Doküman iste",
    demo: "Demo yap",
    follow_up: "Tekrar takip et",
  },
  activityType: {
    phone_call: "Telefon görüşmesi",
    whatsapp: "WhatsApp mesajı",
    email: "E-posta",
    meeting: "Toplantı",
    note: "Not",
    proposal_sent: "Teklif gönderimi",
    payment_request: "Ödeme talebi",
    contract_sent: "Sözleşme gönderimi",
  },
  programType: {
    bootcamp: "Bootcamp",
    advanced_lab: "İleri seviye lab",
    mentorship: "Mentörlük",
    project_team: "Proje takımı",
    other: "Diğer",
  },
  programStatus: {
    draft: "Taslak",
    open: "Kayıt açık",
    ongoing: "Devam ediyor",
    completed: "Tamamlandı",
    cancelled: "İptal",
  },
  paymentStatus: {
    unpaid: "Ödenmedi",
    partial: "Kısmi ödeme",
    paid: "Ödendi",
    refunded: "İade",
    waived: "Muaf / ücretsiz",
  },
  proposalStatus: {
    draft: "Taslak",
    prepared: "Hazırlandı",
    sent: "Gönderildi",
    revision_requested: "Revize istendi",
    accepted: "Kabul edildi",
    rejected: "Reddedildi",
  },
  serviceType: {
    software_dev: "Yazılım geliştirme",
    website: "Web sitesi",
    custom_web_app: "Özel web uygulaması",
    ai_chatbot: "AI chatbot",
    automation: "Otomasyon",
    digital_media: "Dijital medya / içerik",
    it_consulting: "BT danışmanlığı",
    api_integration: "API entegrasyonu",
    maintenance: "Bakım / destek",
    hosting: "Hosting / altyapı",
    brand_landing: "Marka / landing page",
  },
} as const;
