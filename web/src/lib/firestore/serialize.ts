import type {
  Activity,
  Deal,
  Enrollment,
  Lead,
  Program,
  Proposal,
  Task,
} from "@/types/models";
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

export function programFromDoc(id: string, data: DocumentData): Program {
  return {
    id,
    title: data.title ?? "",
    programType: data.programType ?? "other",
    startDate: toDate(data.startDate),
    endDate: toDate(data.endDate),
    price: typeof data.price === "number" ? data.price : undefined,
    status: data.status ?? "draft",
    notes: data.notes,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function enrollmentFromDoc(id: string, data: DocumentData): Enrollment {
  return {
    id,
    programId: data.programId ?? "",
    leadId: data.leadId ?? "",
    paymentStatus: data.paymentStatus ?? "unpaid",
    paymentAmount:
      typeof data.paymentAmount === "number" ? data.paymentAmount : undefined,
    paidAt: toDate(data.paidAt),
    paymentNotes: data.paymentNotes,
    joinedAt: toDate(data.joinedAt),
    techLevel: data.techLevel,
    projectTopic: data.projectTopic,
    mentorName: data.mentorName,
    progressPercent:
      typeof data.progressPercent === "number" ? data.progressPercent : undefined,
    demoAt: toDate(data.demoAt),
    githubUrl: data.githubUrl,
    deployUrl: data.deployUrl,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function proposalFromDoc(id: string, data: DocumentData): Proposal {
  return {
    id,
    dealId: data.dealId ?? "",
    title: data.title ?? "",
    scope: data.scope ?? "",
    price: typeof data.price === "number" ? data.price : undefined,
    status: data.status ?? "draft",
    validUntil: toDate(data.validUntil),
    sentAt: toDate(data.sentAt),
    customerName: data.customerName,
    deliveryNote: data.deliveryNote,
    optionalModules: data.optionalModules,
    createdBy: data.createdBy,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}
