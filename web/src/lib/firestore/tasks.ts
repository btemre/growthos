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
import type { Task, TaskType } from "@/types/models";
import { taskFromDoc } from "./serialize";

/**
 * Subscribe to tasks linked to a specific entity (e.g. lead, deal, or company).
 * Filters on server-side by relatedType and relatedId to avoid downloading all tasks.
 * Results are sorted on client side by createdAt descending to avoid composite index requirements.
 */
export function subscribeTasksForRelated(
  db: Firestore,
  relatedType: Task["relatedType"],
  relatedId: string,
  onData: (tasks: Task[]) => void,
  onError?: (e: Error) => void
): Unsubscribe {
  const col = collection(db, "tasks");
  const q = query(
    col,
    where("relatedType", "==", relatedType),
    where("relatedId", "==", relatedId)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => taskFromDoc(d.id, d.data()));
      items.sort((a, b) => {
        const tA = a.createdAt ? a.createdAt.getTime() : 0;
        const tB = b.createdAt ? b.createdAt.getTime() : 0;
        return tB - tA;
      });
      onData(items);
    },
    (err) => onError?.(err as Error)
  );
}

export function subscribeTasksForUser(
  db: Firestore,
  uid: string,
  isAdmin: boolean,
  onData: (tasks: Task[]) => void,
  onError?: (e: Error) => void
): Unsubscribe {
  const col = collection(db, "tasks");
  const q = isAdmin
    ? query(col, orderBy("createdAt", "desc"))
    : query(
        col,
        where("assignedTo", "==", uid),
        orderBy("createdAt", "desc")
      );

  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => taskFromDoc(d.id, d.data()))),
    (err) => onError?.(err as Error)
  );
}

export async function createTask(
  db: Firestore,
  input: {
    relatedType: "lead" | "deal" | "company";
    relatedId: string;
    assignedTo: string;
    title: string;
    taskType?: TaskType;
    dueDate: Date | null;
    priority: Task["priority"];
    notes?: string;
  }
): Promise<string> {
  const ref = await addDoc(collection(db, "tasks"), {
    ...input,
    status: "open",
    dueDate: input.dueDate,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function completeTask(db: Firestore, taskId: string): Promise<void> {
  await updateDoc(doc(db, "tasks", taskId), {
    status: "done",
    completedAt: serverTimestamp(),
  });
}
