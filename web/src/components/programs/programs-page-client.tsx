"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/auth-context";
import {
  LABELS,
  PROGRAM_STATUSES,
  PROGRAM_TYPES,
} from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import {
  createProgram,
  subscribePrograms,
  updateProgram,
} from "@/lib/firestore/programs";
import type { Program, ProgramStatus, ProgramType } from "@/types/models";

export function ProgramsPageClient() {
  const { firebaseUser, profile } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [title, setTitle] = useState("");
  const [programType, setProgramType] = useState<ProgramType>("bootcamp");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<ProgramStatus>("draft");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const isAdmin = profile?.role === "admin";
  const uid = firebaseUser?.uid;

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    return subscribePrograms(db, setPrograms);
  }, [uid]);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setProgramType("bootcamp");
    setStartDate("");
    setEndDate("");
    setPrice("");
    setStatus("draft");
    setNotes("");
    setDialogOpen(true);
  }

  function openEdit(p: Program) {
    setEditing(p);
    setTitle(p.title);
    setProgramType(p.programType);
    setStartDate(
      p.startDate ? format(p.startDate, "yyyy-MM-dd") : ""
    );
    setEndDate(p.endDate ? format(p.endDate, "yyyy-MM-dd") : "");
    setPrice(p.price != null ? String(p.price) : "");
    setStatus(p.status);
    setNotes(p.notes ?? "");
    setDialogOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAdmin) return;
    setBusy(true);
    try {
      const db = getFirebaseDb();
      const priceNum = price.trim() ? Number(price) : undefined;
      const payload = {
        title: title.trim(),
        programType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        price: Number.isFinite(priceNum as number) ? priceNum : undefined,
        status,
        notes: notes.trim() || undefined,
      };
      if (editing) {
        await updateProgram(db, editing.id, payload);
        toast.success("Program güncellendi");
      } else {
        await createProgram(db, payload);
        toast.success("Program oluşturuldu");
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Kaydedilemedi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
            Programlar
          </h1>
          <p className="text-sm text-muted-foreground">
            Bootcamp ve eğitim programları; katılımcılar program sayfasından
            yönetilir.
          </p>
        </div>
        {isAdmin ? (
          <Button type="button" onClick={openCreate}>
            Yeni program
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liste</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">Fiyat</TableHead>
                {isAdmin ? <TableHead className="w-[100px]" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={`/programs/${p.id}`}
                      className="font-medium hover:underline"
                    >
                      {p.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {LABELS.programType[p.programType]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {LABELS.programStatus[p.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.startDate
                      ? format(p.startDate, "d MMM yyyy", { locale: tr })
                      : "—"}
                    {p.endDate
                      ? ` → ${format(p.endDate, "d MMM yyyy", { locale: tr })}`
                      : ""}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {p.price != null ? `${p.price.toLocaleString("tr-TR")} ₺` : "—"}
                  </TableCell>
                  {isAdmin ? (
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(p)}
                      >
                        Düzenle
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {programs.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              Henüz program yok{isAdmin ? ". Yeni program ekleyin." : "."}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Programu düzenle" : "Yeni program"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Başlık</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tür</Label>
                <Select
                  value={programType}
                  onValueChange={(v) => v && setProgramType(v as ProgramType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {LABELS.programType[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Başlangıç</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bitiş</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fiyat (₺)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Durum</Label>
                <Select
                  value={status}
                  onValueChange={(v) => v && setStatus(v as ProgramStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {LABELS.programStatus[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notlar</Label>
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={busy}>
                {busy ? "Kaydediliyor…" : "Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
