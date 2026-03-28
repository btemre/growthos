import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import type { Activity, ActivityType } from "@/types/models";
import { activityFromDoc } from "./serialize";

export function subscribeActivitiesForRelated(
  db: Firestore,
  relatedType: Activity["relatedType"],
  relatedId: string,
  onData: (rows: Activity[]) => void,
  onError?: (e: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, "activities"),
    where("relatedType", "==", relatedType),
    where("relatedId", "==", relatedId),
    orderBy("activityDate", "desc")
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => activityFromDoc(d.id, d.data()))),
    (err) => onError?.(err as Error)
  );
}

/** Tüm aktiviteler (raporlama); tarih aralığı değişince abonelik yenilenmeli. */
export function subscribeActivitiesInDateRange(
  db: Firestore,
  start: Date,
  end: Date,
  onData: (rows: Activity[]) => void,
  onError?: (e: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, "activities"),
    where("activityDate", ">=", start),
    where("activityDate", "<=", end),
    orderBy("activityDate", "desc")
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => activityFromDoc(d.id, d.data()))),
    (err) => onError?.(err as Error)
  );
}

export async function addActivity(
  db: Firestore,
  input: {
    userId: string;
    relatedType: Activity["relatedType"];
    relatedId: string;
    activityType: ActivityType;
    content: string;
    activityDate?: Date;
  }
): Promise<string> {
  const ref = await addDoc(collection(db, "activities"), {
    ...input,
    activityDate: input.activityDate ?? new Date(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
