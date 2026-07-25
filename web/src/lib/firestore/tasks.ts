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

/**
 * Subscribes to tasks related to a specific entity (lead, deal, company).
 * Performs server-side filtering on relatedType and relatedId, and restricts to the current user's assigned tasks if they are not an admin.
 * Sorts descending by createdAt on the client side to avoid requiring composite indexes.
 */
export function subscribeTasksForRelated(
  db: Firestore,
  uid: string,
  isAdmin: boolean,
  relatedType: "lead" | "deal" | "company",
  relatedId: string,
  onData: (tasks: Task[]) => void,
  onError?: (e: Error) => void
): Unsubscribe {
  const col = collection(db, "tasks");
  const q = isAdmin
    ? query(
        col,
        where("relatedType", "==", relatedType),
        where("relatedId", "==", relatedId)
      )
    : query(
        col,
        where("assignedTo", "==", uid),
        where("relatedType", "==", relatedType),
        where("relatedId", "==", relatedId)
      );

  return onSnapshot(
    q,
    (snap) => {
      const tasks = snap.docs.map((d) => taskFromDoc(d.id, d.data()));
      // Sort descending by createdAt on the client side
      tasks.sort((a, b) => {
        const timeA = a.createdAt?.getTime() ?? 0;
        const timeB = b.createdAt?.getTime() ?? 0;
        return timeB - timeA;
      });
      onData(tasks);
    },
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
