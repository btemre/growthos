import {
  cert,
  getApps,
  initializeApp,
  applicationDefault,
  type App,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function ensureAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (raw) {
    const serviceAccount = JSON.parse(raw) as Record<string, unknown>;
    return initializeApp({
      credential: cert(serviceAccount as Parameters<typeof cert>[0]),
    });
  }
  return initializeApp({ credential: applicationDefault() });
}

export function getAdminAuth() {
  ensureAdminApp();
  return getAuth();
}

export function getAdminDb() {
  ensureAdminApp();
  return getFirestore();
}
