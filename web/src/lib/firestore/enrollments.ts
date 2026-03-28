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
import type { Enrollment, PaymentStatus } from "@/types/models";
import { enrollmentFromDoc } from "./serialize";

/** Son kayıtlar (raporlama); rol kurallarına göre erişilebilen belgeler döner. */
export function subscribeRecentEnrollments(
  db: Firestore,
  onData: (rows: Enrollment[]) => void,
  onError?: (e: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, "enrollments"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => enrollmentFromDoc(d.id, d.data()))),
    (err) => onError?.(err as Error)
  );
}

export function subscribeEnrollmentsByProgram(
  db: Firestore,
  programId: string,
  onData: (rows: Enrollment[]) => void,
  onError?: (e: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, "enrollments"),
    where("programId", "==", programId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => enrollmentFromDoc(d.id, d.data()))),
    (err) => onError?.(err as Error)
  );
}

export function subscribeEnrollmentsByLead(
  db: Firestore,
  leadId: string,
  onData: (rows: Enrollment[]) => void,
  onError?: (e: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, "enrollments"),
    where("leadId", "==", leadId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => enrollmentFromDoc(d.id, d.data()))),
    (err) => onError?.(err as Error)
  );
}

export async function createEnrollment(
  db: Firestore,
  input: {
    programId: string;
    leadId: string;
    paymentStatus?: PaymentStatus;
    paymentAmount?: number;
    joinedAt?: Date | null;
  }
): Promise<string> {
  const now = serverTimestamp();
  const joined = input.joinedAt ?? new Date();
  const ref = await addDoc(collection(db, "enrollments"), {
    programId: input.programId,
    leadId: input.leadId,
    paymentStatus: input.paymentStatus ?? "unpaid",
    paymentAmount: input.paymentAmount,
    paidAt: null,
    paymentNotes: "",
    joinedAt: joined,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateEnrollment(
  db: Firestore,
  enrollmentId: string,
  patch: Partial<{
    paymentStatus: PaymentStatus;
    paymentAmount: number | undefined;
    paidAt: Date | null;
    paymentNotes: string;
    joinedAt: Date | null;
    techLevel: string;
    projectTopic: string;
    mentorName: string;
    progressPercent: number | undefined;
    demoAt: Date | null;
    githubUrl: string;
    deployUrl: string;
  }>
): Promise<void> {
  const data = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  );
  await updateDoc(doc(db, "enrollments", enrollmentId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
