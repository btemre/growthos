import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import type { Company } from "@/types/models";
import { Timestamp } from "firebase/firestore";

function companyFromDoc(id: string, data: Record<string, unknown>): Company {
  const toDate = (v: unknown) =>
    v instanceof Timestamp ? v.toDate() : v instanceof Date ? v : null;
  return {
    id,
    name: (data.name as string) ?? "",
    sector: data.sector as string | undefined,
    website: data.website as string | undefined,
    city: data.city as string | undefined,
    employeeCount: data.employeeCount as string | undefined,
    notes: data.notes as string | undefined,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function listCompanies(db: Firestore): Promise<Company[]> {
  const q = query(collection(db, "companies"), orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => companyFromDoc(d.id, d.data() as Record<string, unknown>));
}

export async function createCompany(
  db: Firestore,
  input: { name: string; sector?: string; city?: string; website?: string }
): Promise<string> {
  const now = serverTimestamp();
  const ref = await addDoc(collection(db, "companies"), {
    ...input,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}
