"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DashboardRightRail } from "@/components/dashboard/dashboard-right-rail";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firebaseUser, profile, loading, needsFirebaseConfig } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || needsFirebaseConfig) return;
    if (!firebaseUser) router.replace("/login");
  }, [firebaseUser, loading, needsFirebaseConfig, router]);

  if (needsFirebaseConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-sm text-muted-foreground">
        Firebase yapılandırması eksik. Önce giriş sayfasındaki yönergeleri tamamlayın.
      </div>
    );
  }

  if (loading || !firebaseUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-10 animate-pulse rounded-full bg-primary/20" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-medium">Profil yüklenemedi</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Firestore&apos;da kullanıcı belgesi oluşturulamadı veya erişim reddedildi. Firestore
          kurallarını ve Authentication ayarlarını kontrol edin.
        </p>
      </div>
    );
  }

  return (
    <AppShell rightPanel={<DashboardRightRail />}>{children}</AppShell>
  );
}
