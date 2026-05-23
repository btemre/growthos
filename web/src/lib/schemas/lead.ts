import { z } from "zod";
import { LEAD_SOURCES, LEAD_TYPES } from "@/lib/constants";

export const leadFormSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı"),
  type: z.enum(LEAD_TYPES),
  source: z.enum(LEAD_SOURCES),
  email: z
    .string()
    .optional()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: "Geçerli bir e-posta girin",
    }),
  phone: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
