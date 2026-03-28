import type {
  ACTIVITY_TYPES,
  CORPORATE_DEAL_STAGES,
  EDUCATION_STAGES,
  LEAD_SOURCES,
  LEAD_TYPES,
  SERVICE_TYPES,
  TASK_TYPES,
  USER_ROLES,
} from "@/lib/constants";

export type UserRole = (typeof USER_ROLES)[number];

export type LeadType = (typeof LEAD_TYPES)[number];

export type LeadSource = (typeof LEAD_SOURCES)[number];

export type EducationStage = (typeof EDUCATION_STAGES)[number];

export type DealStage = (typeof CORPORATE_DEAL_STAGES)[number];

export type TaskType = (typeof TASK_TYPES)[number];

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type ServiceType = (typeof SERVICE_TYPES)[number];

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: "active" | "inactive";
}

export interface Lead {
  id: string;
  type: LeadType;
  name: string;
  companyName?: string;
  source: LeadSource;
  phone?: string;
  email?: string;
  whatsapp?: string;
  city?: string;
  interest?: string;
  needNote?: string;
  ownerId: string;
  educationStage: EducationStage;
  score: number;
  status: string;
  notes?: string;
  nextActionAt?: Date | null;
  lastContactAt?: Date | null;
  tagIds?: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Company {
  id: string;
  name: string;
  sector?: string;
  website?: string;
  city?: string;
  employeeCount?: string;
  notes?: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Deal {
  id: string;
  companyId: string;
  companyName: string;
  contactId?: string;
  ownerId: string;
  title: string;
  serviceType: ServiceType;
  stage: DealStage;
  estimatedValue?: number;
  probability?: number;
  expectedCloseDate?: Date | null;
  notes?: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Activity {
  id: string;
  relatedType: "lead" | "deal" | "company";
  relatedId: string;
  userId: string;
  activityType: ActivityType;
  content: string;
  activityDate: Date | null;
  createdAt: Date | null;
}

export interface Task {
  id: string;
  relatedType: "lead" | "deal" | "company";
  relatedId: string;
  assignedTo: string;
  title: string;
  taskType?: TaskType;
  dueDate: Date | null;
  priority: "low" | "medium" | "high";
  status: "open" | "done" | "cancelled";
  notes?: string;
  completedAt?: Date | null;
  createdAt: Date | null;
}
