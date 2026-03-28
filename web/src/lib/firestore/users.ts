import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  type Firestore,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import type { AppUser, UserRole } from "@/types/models";

export async function ensureUserProfile(db: Firestore, user: User): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const bootstrap = process.env.NEXT_PUBLIC_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const email = user.email?.toLowerCase() ?? "";
  const role: UserRole =
    bootstrap && email && email === bootstrap ? "admin" : "education_sales";

  await setDoc(ref, {
    name: user.displayName || user.email?.split("@")[0] || "Kullanıcı",
    email: user.email ?? "",
    phone: "",
    role,
    status: "active",
    createdAt: serverTimestamp(),
  });
}

export async function fetchUserProfile(
  db: Firestore,
  uid: string
): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    name: d.name ?? "",
    email: d.email ?? "",
    phone: d.phone,
    role: d.role,
    status: d.status === "inactive" ? "inactive" : "active",
  };
}

export async function listUsers(db: Firestore): Promise<AppUser[]> {
  const q = query(collection(db, "users"));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => {
    const d = docSnap.data();
    return {
      id: docSnap.id,
      name: d.name ?? "",
      email: d.email ?? "",
      phone: d.phone,
      role: d.role,
      status: d.status === "inactive" ? "inactive" : "active",
    };
  });
}
