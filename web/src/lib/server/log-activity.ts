import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/server/firebase-admin";

export async function logActivityAdmin(input: {
  userId: string;
  relatedType: "lead" | "deal" | "company";
  relatedId: string;
  activityType: string;
  content: string;
}): Promise<void> {
  const db = getAdminDb();
  await db.collection("activities").add({
    ...input,
    activityDate: Timestamp.now(),
    createdAt: FieldValue.serverTimestamp(),
  });
}
