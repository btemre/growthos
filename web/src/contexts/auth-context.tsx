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
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { ensureUserProfile, fetchUserProfile } from "@/lib/firestore/users";
import type { AppUser } from "@/types/models";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const needsFirebaseConfig = !isFirebaseConfigured();

  const refreshProfile = useCallback(async () => {
    if (needsFirebaseConfig || !firebaseUser) {
      setProfile(null);
      return;
    }
    const db = getFirebaseDb();
    const p = await fetchUserProfile(db, firebaseUser.uid);
    setProfile(p);
  }, [firebaseUser, needsFirebaseConfig]);

  useEffect(() => {
    if (needsFirebaseConfig) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    const db = getFirebaseDb();

    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
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
        setLoading(false);
      }
    });

    return () => unsub();
  }, [needsFirebaseConfig]);

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
