import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import type { EducationStage, Lead, LeadSource, LeadType } from "@/types/models";
import { leadFromDoc } from "./serialize";

export function subscribeLeadsForUser(
  db: Firestore,
  ownerId: string,
  isAdmin: boolean,
  onData: (leads: Lead[]) => void,
  onError?: (e: Error) => void
): Unsubscribe {
  const col = collection(db, "leads");
  const q = isAdmin
    ? query(col, orderBy("updatedAt", "desc"))
    : query(col, where("ownerId", "==", ownerId), orderBy("updatedAt", "desc"));

  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => leadFromDoc(d.id, d.data())));
    },
    (err) => onError?.(err as Error)
  );
}

export async function createLead(
  db: Firestore,
  input: {
    ownerId: string;
    type: LeadType;
    name: string;
    companyName?: string;
    source: LeadSource;
    phone?: string;
    email?: string;
    whatsapp?: string;
    city?: string;
    educationStage?: EducationStage;
  }
): Promise<string> {
  const now = serverTimestamp();
  const ref = await addDoc(collection(db, "leads"), {
    ...input,
    educationStage: input.educationStage ?? "new_application",
    score: 0,
    status: "active",
    lastContactAt: null,
    nextActionAt: null,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateLead(
  db: Firestore,
  leadId: string,
  patch: Partial<{
    educationStage: EducationStage;
    name: string;
    source: LeadSource;
    score: number;
    notes: string;
    lastContactAt: Date | null;
    nextActionAt: Date | null;
    status: string;
  }>
): Promise<void> {
  const ref = doc(db, "leads", leadId);
  await updateDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}
