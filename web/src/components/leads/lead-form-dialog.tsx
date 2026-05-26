"use client";

import { useState, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_SOURCES, LEAD_TYPES, LABELS } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { createLead } from "@/lib/firestore/leads";
import {
  leadFormSchema,
  type LeadFormValues,
} from "@/lib/schemas/lead";
import type { LeadSource, LeadType } from "@/types/models";

export function LeadFormDialog({ ownerId }: { ownerId: string }) {
  const [open, setOpen] = useState(false);
  const typeId = useId();
  const sourceId = useId();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      type: "education_candidate",
      source: "whatsapp",
      email: "",
      phone: "",
    },
  });

  const type = watch("type");
  const source = watch("source");

  async function onSubmit(values: LeadFormValues) {
    try {
      const db = getFirebaseDb();
      await createLead(db, {
        ownerId,
        type: values.type,
        name: values.name.trim(),
        source: values.source,
        email: values.email?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
      });
      toast.success("Lead oluşturuldu");
      setOpen(false);
      reset();
    } catch (err) {
      console.error(err);
      toast.error("Kaydedilemedi");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" onClick={() => setOpen(true)}>
        Yeni lead
      </Button>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Yeni lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lead-name">Ad / görünen ad</Label>
              <Input id="lead-name" {...register("name")} />
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor={typeId}>Tür</Label>
              <Select
                value={type}
                onValueChange={(v) => v && setValue("type", v as LeadType)}
              >
                <SelectTrigger id={typeId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {LABELS.leadType[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={sourceId}>Kaynak</Label>
              <Select
                value={source}
                onValueChange={(v) => v && setValue("source", v as LeadSource)}
              >
                <SelectTrigger id={sourceId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {LABELS.source[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-email">E-posta</Label>
              <Input id="lead-email" type="email" {...register("email")} />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-phone">Telefon</Label>
              <Input id="lead-phone" {...register("phone")} />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
