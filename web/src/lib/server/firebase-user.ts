import { getAdminAuth, getAdminDb } from "@/lib/server/firebase-admin";

export async function verifyIdTokenFromRequest(
  request: Request
): Promise<{ uid: string; email?: string } | null> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}

export async function fetchUserRole(uid: string): Promise<string | null> {
  const snap = await getAdminDb().collection("users").doc(uid).get();
  if (!snap.exists) return null;
  const role = snap.data()?.role;
  return typeof role === "string" ? role : null;
}

export async function canAccessLead(
  uid: string,
  role: string | null,
  leadId: string
): Promise<boolean> {
  if (role === "admin") return true;
  const snap = await getAdminDb().collection("leads").doc(leadId).get();
  if (!snap.exists) return false;
  return snap.data()?.ownerId === uid;
}
