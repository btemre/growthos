import {
  Timestamp,
  type FieldValue,
  serverTimestamp,
} from "firebase/firestore";

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

export function firestoreNow(): FieldValue {
  return serverTimestamp();
}
