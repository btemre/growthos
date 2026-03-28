"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  applyFirebaseConfig,
  getFirebaseAuth,
  getFirebaseDb,
} from "@/lib/firebase/client";
import { ensureUserProfile, fetchUserProfile } from "@/lib/firestore/users";
import type { AppUser } from "@/types/models";

type BootstrapState = "loading" | "ready" | "missing";

type AuthContextValue = {
  firebaseUser: User | null;
  profile: AppUser | null;
  loading: boolean;
  needsFirebaseConfig: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function initialBootstrap(): BootstrapState {
  return isFirebaseConfigured() ? "ready" : "loading";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [bootstrapState, setBootstrapState] = useState<BootstrapState>(initialBootstrap);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const needsFirebaseConfig = bootstrapState === "missing";

  const refreshProfile = useCallback(async () => {
    if (needsFirebaseConfig || bootstrapState !== "ready" || !firebaseUser) {
      setProfile(null);
      return;
    }
    const db = getFirebaseDb();
    const p = await fetchUserProfile(db, firebaseUser.uid);
    setProfile(p);
  }, [firebaseUser, needsFirebaseConfig, bootstrapState]);

  useEffect(() => {
    if (isFirebaseConfigured()) {
      setBootstrapState("ready");
      return;
    }

    let cancelled = false;
    fetch("/api/firebase-config")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("config fetch"))))
      .then((data: Record<string, string>) => {
        if (cancelled) return;
        if (data?.apiKey && data?.projectId && data?.appId) {
          applyFirebaseConfig({
            apiKey: data.apiKey,
            authDomain: data.authDomain,
            projectId: data.projectId,
            storageBucket: data.storageBucket,
            messagingSenderId: data.messagingSenderId,
            appId: data.appId,
          });
          setBootstrapState("ready");
        } else {
          setBootstrapState("missing");
        }
      })
      .catch(() => {
        if (!cancelled) setBootstrapState("missing");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (bootstrapState !== "ready") {
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();

    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setProfile(null);
        setAuthLoading(false);
        return;
      }
      try {
        await ensureUserProfile(db, user);
        const p = await fetchUserProfile(db, user.uid);
        setProfile(p);
      } catch (e) {
        console.error(e);
        setProfile(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsub();
  }, [bootstrapState]);

  const loading =
    bootstrapState === "loading" || (bootstrapState === "ready" && authLoading);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await createUserWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser,
      profile,
      loading,
      needsFirebaseConfig,
      signIn,
      signUp,
      logout,
      refreshProfile,
    }),
    [
      firebaseUser,
      profile,
      loading,
      needsFirebaseConfig,
      signIn,
      signUp,
      logout,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
