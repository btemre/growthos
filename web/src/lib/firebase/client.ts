import {
  initializeApp,
  getApps,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig, isFirebaseConfigured } from "./config";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

/** App Hosting: runtime ortamından gelen config (build’te gömülü değil) */
let resolvedConfig: FirebaseOptions | null = null;

export function applyFirebaseConfig(config: FirebaseOptions): void {
  resolvedConfig = {
    apiKey: config.apiKey,
    authDomain: config.authDomain ?? "",
    projectId: config.projectId,
    storageBucket: config.storageBucket ?? "",
    messagingSenderId: config.messagingSenderId ?? "",
    appId: config.appId,
  };
  app = undefined;
  auth = undefined;
  db = undefined;
}

function getEffectiveConfig(): FirebaseOptions {
  if (resolvedConfig?.apiKey && resolvedConfig.projectId && resolvedConfig.appId) {
    return resolvedConfig;
  }
  if (isFirebaseConfigured()) {
    return firebaseConfig as FirebaseOptions;
  }
  throw new Error(
    "Firebase yapılandırılmadı. web/.env.local veya App Hosting ortam değişkenlerini kontrol edin."
  );
}

export function getFirebaseApp(): FirebaseApp {
  const cfg = getEffectiveConfig();
  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(cfg);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}
