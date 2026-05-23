import { z } from "zod";
import { SERVICE_TYPES } from "@/lib/constants";

export const dealFormSchema = z.object({
  companyName: z.string().min(2, "Firma adı en az 2 karakter olmalı"),
  title: z.string().min(2, "Başlık en az 2 karakter olmalı"),
  serviceType: z.enum(SERVICE_TYPES),
  estimatedValue: z.string().optional(),
});

export type DealFormValues = z.infer<typeof dealFormSchema>;
