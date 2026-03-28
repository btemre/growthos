import type { Activity, Deal, Lead, Task } from "@/types/models";
import type { DocumentData } from "firebase/firestore";
import { toDate } from "@/lib/firebase/timestamps";

export function leadFromDoc(id: string, data: DocumentData): Lead {
  return {
    id,
    type: data.type,
    name: data.name ?? "",
    companyName: data.companyName,
    source: data.source,
    phone: data.phone,
    email: data.email,
    whatsapp: data.whatsapp,
    city: data.city,
    interest: data.interest,
    needNote: data.needNote,
    ownerId: data.ownerId ?? "",
    educationStage: data.educationStage ?? "new_application",
    score: typeof data.score === "number" ? data.score : 0,
    status: data.status ?? "active",
    notes: data.notes,
    nextActionAt: toDate(data.nextActionAt),
    lastContactAt: toDate(data.lastContactAt),
    tagIds: data.tagIds,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function dealFromDoc(id: string, data: DocumentData): Deal {
  return {
    id,
    companyId: data.companyId ?? "",
    companyName: data.companyName ?? "",
    contactId: data.contactId,
    ownerId: data.ownerId ?? "",
    title: data.title ?? "",
    serviceType: data.serviceType ?? "software_dev",
    stage: data.stage ?? "potential_company",
    estimatedValue: data.estimatedValue,
    probability: data.probability,
    expectedCloseDate: toDate(data.expectedCloseDate),
    notes: data.notes,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function activityFromDoc(id: string, data: DocumentData): Activity {
  return {
    id,
    relatedType: data.relatedType,
    relatedId: data.relatedId ?? "",
    userId: data.userId ?? "",
    activityType: data.activityType ?? "note",
    content: data.content ?? "",
    activityDate: toDate(data.activityDate),
    createdAt: toDate(data.createdAt),
  };
}

export function taskFromDoc(id: string, data: DocumentData): Task {
  return {
    id,
    relatedType: data.relatedType,
    relatedId: data.relatedId ?? "",
    assignedTo: data.assignedTo ?? "",
    title: data.title ?? "",
    taskType: data.taskType,
    dueDate: toDate(data.dueDate),
    priority: data.priority ?? "medium",
    status: data.status ?? "open",
    notes: data.notes,
    completedAt: toDate(data.completedAt),
    createdAt: toDate(data.createdAt),
  };
}
