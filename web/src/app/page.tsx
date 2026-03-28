"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function HomePage() {
  const { firebaseUser, loading, needsFirebaseConfig } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (needsFirebaseConfig) {
      router.replace("/login");
      return;
    }
    if (firebaseUser) router.replace("/dashboard");
    else router.replace("/login");
  }, [firebaseUser, loading, needsFirebaseConfig, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="size-10 animate-pulse rounded-full bg-primary/20" />
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      </div>
    </div>
  );
}
