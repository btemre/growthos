"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const { signIn, signUp, needsFirebaseConfig, loading, firebaseUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || needsFirebaseConfig) return;
    if (firebaseUser) router.replace("/dashboard");
  }, [firebaseUser, loading, needsFirebaseConfig, router]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn(email, password);
      toast.success("Giriş başarılı");
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Giriş başarısız. E-posta ve şifreyi kontrol edin.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signUp(email, password);
      toast.success("Hesap oluşturuldu");
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Kayıt başarısız. Şifre en az 6 karakter olmalıdır.");
    } finally {
      setBusy(false);
    }
  }

  if (needsFirebaseConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-lg border-dashed shadow-lg">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-heading)] text-2xl">
              Firebase yapılandırması gerekli
            </CardTitle>
            <CardDescription>
              <strong>Yerel:</strong>{" "}
              <code className="rounded bg-muted px-1">web/.env.local</code> içinde{" "}
              <code className="rounded bg-muted px-1">NEXT_PUBLIC_FIREBASE_*</code>{" "}
              değişkenlerini doldurun; sunucuyu yeniden başlatın.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>App Hosting:</strong> Backend → Environment içinde aynı isimli
              değişkenler tanımlı olsun (mümkünse hem build hem runtime). Değerler boşsa
              veya API anahtarında yazım hatası varsa bu ekran görünür.
            </p>
            <p>
              Firestore için:{" "}
              <code className="rounded bg-muted px-1">firebase deploy --only firestore</code>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <div className="size-10 animate-pulse rounded-full bg-primary/20" />
        <p className="text-sm text-muted-foreground">Firebase bağlantısı kuruluyor…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            GOS
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight">
            Growth Operating System
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Eğitim ve iş geliştirme paneline giriş
          </p>
        </div>

        <Card className="border-border/80 shadow-xl shadow-primary/5">
          <Tabs defaultValue="signin">
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Giriş</TabsTrigger>
                <TabsTrigger value="signup">Kayıt</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <TabsContent value="signin" className="mt-0 space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Şifre</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy || loading}>
                    Giriş yap
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup" className="mt-0 space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="su-email">E-posta</Label>
                    <Input
                      id="su-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-password">Şifre (min. 6)</Label>
                    <Input
                      id="su-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy || loading}>
                    Hesap oluştur
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Yönetici rolü için ortamda{" "}
                    <code className="rounded bg-muted px-1">NEXT_PUBLIC_BOOTSTRAP_ADMIN_EMAIL</code>{" "}
                    ile e-postanızı eşleştirin veya Firestore kullanıcı belgesinde{" "}
                    <code className="rounded bg-muted px-1">role</code> alanını{" "}
                    <code className="rounded bg-muted px-1">admin</code> yapın.
                  </p>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="underline-offset-4 hover:underline">
            Ana sayfa
          </Link>
        </p>
      </div>
    </div>
  );
}
