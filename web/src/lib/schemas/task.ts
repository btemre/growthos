import { z } from "zod";
import { TASK_TYPES } from "@/lib/constants";

export const taskFormSchema = z.object({
  title: z.string().min(2, "Başlık en az 2 karakter olmalı"),
  taskType: z.enum(TASK_TYPES).optional(),
  dueDate: z.string().optional(),
  leadId: z.string().min(1, "Lead seçin"),
  priority: z.enum(["low", "medium", "high"]),
  notes: z.string().optional(),
  relatedId: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
