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
import type { Deal, DealStage, ServiceType } from "@/types/models";
import { dealFromDoc } from "./serialize";

export function subscribeDealsForUser(
  db: Firestore,
  ownerId: string,
  isAdmin: boolean,
  onData: (deals: Deal[]) => void,
  onError?: (e: Error) => void
): Unsubscribe {
  const col = collection(db, "deals");
  const q = isAdmin
    ? query(col, orderBy("updatedAt", "desc"))
    : query(col, where("ownerId", "==", ownerId), orderBy("updatedAt", "desc"));

  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => dealFromDoc(d.id, d.data()))),
    (err) => onError?.(err as Error)
  );
}

export async function createDeal(
  db: Firestore,
  input: {
    ownerId: string;
    companyId: string;
    companyName: string;
    title: string;
    serviceType: ServiceType;
    stage?: DealStage;
    estimatedValue?: number;
    probability?: number;
  }
): Promise<string> {
  const now = serverTimestamp();
  const ref = await addDoc(collection(db, "deals"), {
    ...input,
    stage: input.stage ?? "potential_company",
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateDealStage(
  db: Firestore,
  dealId: string,
  stage: DealStage
): Promise<void> {
  await updateDoc(doc(db, "deals", dealId), {
    stage,
    updatedAt: serverTimestamp(),
  });
}
