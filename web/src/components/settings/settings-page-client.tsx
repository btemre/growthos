"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/contexts/auth-context";
import { LABELS } from "@/lib/constants";
import { formatVersionLabel, getBuildInfo } from "@/lib/build-info";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function SettingsPageClient() {
  const { profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { version, buildTime, gitSha } = getBuildInfo();

  const initials =
    profile?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "G";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Ayarlar"
        description="Profil, görünüm ve uygulama bilgileri."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">{profile?.name ?? "—"}</p>
            <p className="text-muted-foreground">{profile?.email}</p>
            <p className="mt-1 text-muted-foreground">
              Rol:{" "}
              {profile?.role ? LABELS.role[profile.role] : "Atanmadı"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Görünüm</CardTitle>
          <CardDescription>Açık, koyu veya sistem teması.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="theme-select">Tema</Label>
          <Select value={theme ?? "system"} onValueChange={(v) => v && setTheme(v)}>
            <SelectTrigger id="theme-select" className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Açık</SelectItem>
              <SelectItem value="dark">Koyu</SelectItem>
              <SelectItem value="system">Sistem</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Otomasyon kuralları</CardTitle>
          <CardDescription>
            Sunucu tarafı cron ile çalışan kurallar (özet).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="list-inside list-disc space-y-1">
            <li>Ödeme bekleyen aday — 2 gün sessizse takip görevi</li>
            <li>Yeni lead — ilk temas hatırlatması (planlanan)</li>
            <li>Teklif gönderildi — 3 gün sonra follow-up (planlanan)</li>
          </ul>
          <p className="text-xs">
            Detaylı log ve kural düzenleme V2 ile{" "}
            <code className="rounded bg-muted px-1">/api/cron/automation</code> üzerinden
            genişletilecek.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bildirimler</CardTitle>
          <CardDescription>V2 webhook entegrasyonları için hazırlık.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          E-posta ve WhatsApp hatırlatmaları yakında ayarlanabilir olacak.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uygulama sürümü</CardTitle>
          <CardDescription>
            Build sırasında <code className="text-xs">web/version.json</code> güncellenir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-mono text-base font-medium tabular-nums">
            {formatVersionLabel(version)}
          </p>
          {buildTime ? (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Build:</span> {buildTime}
            </p>
          ) : null}
          {gitSha ? (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Commit:</span>{" "}
              <span className="font-mono text-xs">{gitSha}</span>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
