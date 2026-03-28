"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { LABELS, PAYMENT_STATUSES } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import {
  createEnrollment,
  subscribeEnrollmentsByProgram,
  updateEnrollment,
} from "@/lib/firestore/enrollments";
import { subscribeLeadsForUser } from "@/lib/firestore/leads";
import { programFromDoc } from "@/lib/firestore/serialize";
import { cn } from "@/lib/utils";
import type { Enrollment, Lead, PaymentStatus, Program } from "@/types/models";

function canManageEnrollment(role: string | undefined) {
  return (
    role === "admin" ||
    role === "operations" ||
    role === "mentor" ||
    role === "education_sales"
  );
}

export function ProgramDetailClient({ programId }: { programId: string }) {
  const { firebaseUser, profile } = useAuth();
  const [program, setProgram] = useState<Program | null>(null);
  const [programLoading, setProgramLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Enrollment | null>(null);
  const [leadId, setLeadId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("unpaid");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [joinedAt, setJoinedAt] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [techLevel, setTechLevel] = useState("");
  const [projectTopic, setProjectTopic] = useState("");
  const [mentorName, setMentorName] = useState("");
  const [progressPercent, setProgressPercent] = useState("");
  const [demoAt, setDemoAt] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [deployUrl, setDeployUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";
  const canManage = canManageEnrollment(profile?.role);

  useEffect(() => {
    const db = getFirebaseDb();
    const ref = doc(db, "programs", programId);
    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setProgram(null);
        setProgramLoading(false);
        return;
      }
      setProgram(programFromDoc(snap.id, snap.data()));
      setProgramLoading(false);
    });
  }, [programId]);

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    return subscribeEnrollmentsByProgram(db, programId, setEnrollments);
  }, [uid, programId]);

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    return subscribeLeadsForUser(db, uid, isAdmin, setLeads);
  }, [uid, isAdmin]);

  const leadById = useMemo(() => {
    const m = new Map<string, Lead>();
    for (const l of leads) m.set(l.id, l);
    return m;
  }, [leads]);

  const leadChoices = useMemo(() => {
    return leads.filter(
      (l) =>
        l.type === "education_candidate" ||
        l.educationStage === "enrolled" ||
        l.educationStage === "awaiting_payment"
    );
  }, [leads]);

  function resetForm() {
    setLeadId("");
    setPaymentStatus("unpaid");
    setPaymentAmount("");
    setJoinedAt("");
    setPaidAt("");
    setPaymentNotes("");
    setTechLevel("");
    setProjectTopic("");
    setMentorName("");
    setProgressPercent("");
    setDemoAt("");
    setGithubUrl("");
    setDeployUrl("");
  }

  function openAdd() {
    setEditRow(null);
    resetForm();
    setJoinedAt(format(new Date(), "yyyy-MM-dd"));
    setAddOpen(true);
  }

  function openEdit(e: Enrollment) {
    setEditRow(e);
    setLeadId(e.leadId);
    setPaymentStatus(e.paymentStatus);
    setPaymentAmount(
      e.paymentAmount != null ? String(e.paymentAmount) : ""
    );
    setJoinedAt(
      e.joinedAt ? format(e.joinedAt, "yyyy-MM-dd") : ""
    );
    setPaidAt(e.paidAt ? format(e.paidAt, "yyyy-MM-dd") : "");
    setPaymentNotes(e.paymentNotes ?? "");
    setTechLevel(e.techLevel ?? "");
    setProjectTopic(e.projectTopic ?? "");
    setMentorName(e.mentorName ?? "");
    setProgressPercent(
      e.progressPercent != null ? String(e.progressPercent) : ""
    );
    setDemoAt(e.demoAt ? format(e.demoAt, "yyyy-MM-dd'T'HH:mm") : "");
    setGithubUrl(e.githubUrl ?? "");
    setDeployUrl(e.deployUrl ?? "");
    setAddOpen(true);
  }

  async function onSubmitEnrollment(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;
    setBusy(true);
    try {
      const db = getFirebaseDb();
      const amt = paymentAmount.trim() ? Number(paymentAmount) : undefined;
      const progress = progressPercent.trim()
        ? Number(progressPercent)
        : undefined;
      if (editRow) {
        await updateEnrollment(db, editRow.id, {
          paymentStatus,
          paymentAmount: Number.isFinite(amt as number) ? amt : undefined,
          joinedAt: joinedAt ? new Date(joinedAt) : null,
          paidAt: paidAt ? new Date(paidAt) : null,
          paymentNotes: paymentNotes.trim() || undefined,
          techLevel: techLevel.trim() || undefined,
          projectTopic: projectTopic.trim() || undefined,
          mentorName: mentorName.trim() || undefined,
          progressPercent: Number.isFinite(progress as number)
            ? progress
            : undefined,
          demoAt: demoAt ? new Date(demoAt) : null,
          githubUrl: githubUrl.trim() || undefined,
          deployUrl: deployUrl.trim() || undefined,
        });
        toast.success("Kayıt güncellendi");
      } else {
        if (!leadId) {
          toast.error("Lead seçin");
          setBusy(false);
          return;
        }
        await createEnrollment(db, {
          programId,
          leadId,
          paymentStatus,
          paymentAmount: Number.isFinite(amt as number) ? amt : undefined,
          joinedAt: joinedAt ? new Date(joinedAt) : new Date(),
        });
        toast.success("Kayıt eklendi");
      }
      setAddOpen(false);
      resetForm();
      setEditRow(null);
    } catch (err) {
      console.error(err);
      toast.error("İşlem başarısız");
    } finally {
      setBusy(false);
    }
  }

  if (programLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="size-8 animate-pulse rounded-full bg-primary/20" />
      </div>
    );
  }

  if (!program) {
    return (
      <p className="text-sm text-muted-foreground">
        Program bulunamadı veya erişim yok.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/programs"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-fit -ml-2 inline-flex items-center"
            )}
          >
            <ArrowLeft className="mr-1 size-4" />
            Programlar
          </Link>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
            {program.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {LABELS.programType[program.programType]}
            </Badge>
            <Badge variant="outline">
              {LABELS.programStatus[program.status]}
            </Badge>
          </div>
        </div>
        {canManage ? (
          <Button type="button" onClick={openAdd}>
            Kayıt ekle
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Özet</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Tarih aralığı</p>
            <p>
              {program.startDate
                ? format(program.startDate, "d MMMM yyyy", { locale: tr })
                : "—"}
              {program.endDate
                ? ` — ${format(program.endDate, "d MMMM yyyy", { locale: tr })}`
                : ""}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Liste fiyatı</p>
            <p>
              {program.price != null
                ? `${program.price.toLocaleString("tr-TR")} ₺`
                : "—"}
            </p>
          </div>
          {program.notes ? (
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Notlar</p>
              <p className="whitespace-pre-wrap">{program.notes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Katılımcılar</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Ödeme</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Kayıt</TableHead>
                {canManage ? <TableHead className="w-[100px]" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((row) => {
                const lead = leadById.get(row.leadId);
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Link
                        href={`/leads/${row.leadId}`}
                        className="font-medium hover:underline"
                      >
                        {lead?.name ?? row.leadId.slice(0, 8) + "…"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {LABELS.paymentStatus[row.paymentStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.paymentAmount != null
                        ? `${row.paymentAmount.toLocaleString("tr-TR")} ₺`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.joinedAt
                        ? format(row.joinedAt, "d MMM yyyy", { locale: tr })
                        : "—"}
                    </TableCell>
                    {canManage ? (
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(row)}
                        >
                          Düzenle
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {enrollments.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              Bu programda henüz kayıt yok.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <form onSubmit={onSubmitEnrollment}>
            <DialogHeader>
              <DialogTitle>
                {editRow ? "Kaydı düzenle" : "Yeni kayıt"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid max-h-[65vh] gap-4 overflow-y-auto py-4 pr-1">
              {!editRow ? (
                <div className="space-y-2">
                  <Label>Lead</Label>
                  <Select value={leadId} onValueChange={setLeadId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Lead seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadChoices.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Lead</Label>
                  <p className="text-sm">
                    <Link
                      href={`/leads/${editRow.leadId}`}
                      className="font-medium hover:underline"
                    >
                      {leadById.get(editRow.leadId)?.name ?? editRow.leadId}
                    </Link>
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Ödeme durumu</Label>
                  <Select
                    value={paymentStatus}
                    onValueChange={(v) =>
                      v && setPaymentStatus(v as PaymentStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {LABELS.paymentStatus[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tutar (₺)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Kayıt tarihi</Label>
                  <Input
                    type="date"
                    value={joinedAt}
                    onChange={(e) => setJoinedAt(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ödeme tarihi</Label>
                  <Input
                    type="date"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ödeme notu</Label>
                <Textarea
                  rows={2}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Teknik seviye</Label>
                <Input
                  value={techLevel}
                  onChange={(e) => setTechLevel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Proje konusu</Label>
                <Input
                  value={projectTopic}
                  onChange={(e) => setProjectTopic(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Mentor</Label>
                <Input
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>İlerleme %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={progressPercent}
                    onChange={(e) => setProgressPercent(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Demo (tarih/saat)</Label>
                  <Input
                    type="datetime-local"
                    value={demoAt}
                    onChange={(e) => setDemoAt(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>GitHub</Label>
                <Input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Deploy URL</Label>
                <Input
                  value={deployUrl}
                  onChange={(e) => setDeployUrl(e.target.value)}
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
