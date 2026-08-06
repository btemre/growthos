"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/contexts/auth-context";
import { LABELS, SERVICE_TYPES } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { createCompany } from "@/lib/firestore/companies";
import { createDeal } from "@/lib/firestore/deals";
import {
  dealFormSchema,
  type DealFormValues,
} from "@/lib/schemas/deal";
import { cn } from "@/lib/utils";
import type { ServiceType } from "@/types/models";

function DealFormFields({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (values: DealFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      companyName: "",
      title: "",
      serviceType: "software_dev",
      estimatedValue: "",
    },
  });

  const serviceType = watch("serviceType");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="companyName">Firma adı</Label>
        <Input id="companyName" {...register("companyName")} />
        {errors.companyName ? (
          <p className="text-xs text-destructive">{errors.companyName.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Fırsat başlığı</Label>
        <Input id="title" {...register("title")} />
        {errors.title ? (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="service-type-select">Hizmet türü</Label>
        <Select
          value={serviceType}
          onValueChange={(v) => v && setValue("serviceType", v as ServiceType)}
        >
          <SelectTrigger id="service-type-select">
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
        <Label htmlFor="estimatedValue">Tahmini değer (₺)</Label>
        <Input
          id="estimatedValue"
          type="number"
          min={0}
          {...register("estimatedValue")}
        />
      </div>
      <Button type="submit" loading={busy} className="w-full">
        Oluştur
      </Button>
    </form>
  );
}

export function NewDealForm() {
  const router = useRouter();
  const { firebaseUser, profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const can =
    profile?.role === "admin" || profile?.role === "business_dev";
  const uid = firebaseUser?.uid ?? "";

  async function onSubmit(values: DealFormValues) {
    if (!uid) return;
    setBusy(true);
    try {
      const db = getFirebaseDb();
      const cid = await createCompany(db, { name: values.companyName.trim() });
      await createDeal(db, {
        ownerId: uid,
        companyId: cid,
        companyName: values.companyName.trim(),
        title: values.title.trim(),
        serviceType: values.serviceType,
        estimatedValue: values.estimatedValue
          ? Number(values.estimatedValue)
          : undefined,
      });
      toast.success("Fırsat oluşturuldu");
      setSheetOpen(false);
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
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Bu sayfa yalnızca iş geliştirme veya yönetici rolü içindir.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yeni kurumsal fırsat"
        description="Firma ve deal kaydı oluşturun."
        action={
          <Link
            href="/pipeline/corporate"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Geri
          </Link>
        }
      />

      <div className="hidden md:block">
        <Card className="mx-auto max-w-lg">
          <CardContent className="pt-6">
            <DealFormFields busy={busy} onSubmit={onSubmit} />
          </CardContent>
        </Card>
      </div>

      <div className="md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger className={cn(buttonVariants(), "w-full")}>
            Fırsat formunu aç
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Yeni fırsat</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <DealFormFields busy={busy} onSubmit={onSubmit} />
            </div>
          </SheetContent>
        </Sheet>
        {!sheetOpen ? (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Mobilde tam ekran form için yukarıdaki düğmeyi kullanın.
          </p>
        ) : null}
      </div>
    </div>
  );
}
