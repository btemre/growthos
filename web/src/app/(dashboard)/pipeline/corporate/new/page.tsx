"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { LABELS, SERVICE_TYPES } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { createCompany } from "@/lib/firestore/companies";
import { createDeal } from "@/lib/firestore/deals";
import type { ServiceType } from "@/types/models";
import Link from "next/link";

export default function NewDealPage() {
  const router = useRouter();
  const { firebaseUser, profile } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("software_dev");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const can =
    profile?.role === "admin" || profile?.role === "business_dev";
  const uid = firebaseUser?.uid ?? "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid || !companyName.trim() || !title.trim()) return;
    setBusy(true);
    try {
      const db = getFirebaseDb();
      const cid = await createCompany(db, { name: companyName.trim() });
      await createDeal(db, {
        ownerId: uid,
        companyId: cid,
        companyName: companyName.trim(),
        title: title.trim(),
        serviceType,
        estimatedValue: value ? Number(value) : undefined,
      });
      toast.success("Fırsat oluşturuldu");
      router.push("/pipeline/corporate");
    } catch (err) {
      console.error(err);
      toast.error("Kaydedilemedi");
    } finally {
      setBusy(false);
    }
  }

  if (!can) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erişim</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Bu sayfa yalnızca iş geliştirme veya yönetici rolü içindir.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
          Yeni kurumsal fırsat
        </h2>
        <Link
          href="/pipeline/corporate"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Geri
        </Link>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Firma adı</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Fırsat başlığı</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Hizmet türü</Label>
              <Select
                value={serviceType}
                onValueChange={(v) => v && setServiceType(v as ServiceType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {LABELS.serviceType[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tahmini değer (₺, opsiyonel)</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={busy}>
              Kaydet
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
