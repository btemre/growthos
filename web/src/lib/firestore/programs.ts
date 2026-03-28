import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import type { Program, ProgramStatus, ProgramType } from "@/types/models";
import { programFromDoc } from "./serialize";

export function subscribePrograms(
  db: Firestore,
  onData: (programs: Program[]) => void,
  onError?: (e: Error) => void
): Unsubscribe {
  const q = query(collection(db, "programs"), orderBy("updatedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => programFromDoc(d.id, d.data()))),
    (err) => onError?.(err as Error)
  );
}

export async function createProgram(
  db: Firestore,
  input: {
    title: string;
    programType: ProgramType;
    startDate?: Date | null;
    endDate?: Date | null;
    price?: number;
    status?: ProgramStatus;
    notes?: string;
  }
): Promise<string> {
  const now = serverTimestamp();
  const ref = await addDoc(collection(db, "programs"), {
    title: input.title,
    programType: input.programType,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    price: input.price,
    status: input.status ?? "draft",
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateProgram(
  db: Firestore,
  programId: string,
  patch: Partial<{
    title: string;
    programType: ProgramType;
    startDate: Date | null;
    endDate: Date | null;
    price: number | undefined;
    status: ProgramStatus;
    notes: string;
  }>
): Promise<void> {
  const data = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  );
  await updateDoc(doc(db, "programs", programId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
