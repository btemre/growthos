"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import {
  ACTIVITY_TYPES,
  EDUCATION_STAGES,
  LABELS,
  TASK_TYPES,
} from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { addActivity, subscribeActivitiesForRelated } from "@/lib/firestore/activities";
import { subscribeTasksForUser, createTask, completeTask } from "@/lib/firestore/tasks";
import { subscribeEnrollmentsByLead } from "@/lib/firestore/enrollments";
import { updateLead } from "@/lib/firestore/leads";
import { subscribePrograms } from "@/lib/firestore/programs";
import { leadFromDoc } from "@/lib/firestore/serialize";
import type {
  Activity,
  EducationStage,
  Enrollment,
  Lead,
  Program,
  Task,
} from "@/types/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActivityType, TaskType } from "@/types/models";

function coerceTaskType(raw: string): TaskType {
  const t = raw?.trim();
  if (t && TASK_TYPES.includes(t as TaskType)) return t as TaskType;
  return "follow_up";
}

export function LeadDetailClient({ leadId }: { leadId: string }) {
  const { firebaseUser, profile } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [leadLoading, setLeadLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState("");
  const [score, setScore] = useState(0);
  const [activityContent, setActivityContent] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("note");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [aiAction, setAiAction] = useState("");
  const [aiTaskType, setAiTaskType] = useState<TaskType>("follow_up");
  const [aiBusy, setAiBusy] = useState(false);
  const [polishDraft, setPolishDraft] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [waBody, setWaBody] = useState("");
  const [channelBusy, setChannelBusy] = useState(false);
  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";

  const programTitleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of programs) m.set(p.id, p.title);
    return m;
  }, [programs]);

  useEffect(() => {
    const db = getFirebaseDb();
    const ref = doc(db, "leads", leadId);
    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setLead(null);
        setLeadLoading(false);
        return;
      }
      const l = leadFromDoc(snap.id, snap.data());
      setLead(l);
      setNotes(l.notes ?? "");
      setScore(l.score);
      setLeadLoading(false);
    });
  }, [leadId]);

  useEffect(() => {
    const db = getFirebaseDb();
    return subscribeActivitiesForRelated(db, "lead", leadId, setActivities);
  }, [leadId]);

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    const unsub = subscribeTasksForUser(db, uid, isAdmin, (all) => {
      setTasks(all.filter((t) => t.relatedType === "lead" && t.relatedId === leadId));
    });
    return () => unsub();
  }, [uid, isAdmin, leadId]);

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    return subscribeEnrollmentsByLead(db, leadId, setEnrollments);
  }, [uid, leadId]);

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    return subscribePrograms(db, setPrograms);
  }, [uid]);

  async function saveGeneral() {
    if (!lead) return;
    try {
      const db = getFirebaseDb();
      await updateLead(db, lead.id, {
        notes,
        score: Number(score),
      });
      toast.success("Kaydedildi");
    } catch (e) {
      console.error(e);
      toast.error("Kaydedilemedi");
    }
  }

  async function saveStage(s: EducationStage) {
    if (!lead) return;
    try {
      const db = getFirebaseDb();
      await updateLead(db, lead.id, { educationStage: s });
      toast.success("Aşama güncellendi");
    } catch (e) {
      console.error(e);
      toast.error("Güncellenemedi");
    }
  }

  async function addActivityRow() {
    if (!uid || !activityContent.trim()) return;
    try {
      const db = getFirebaseDb();
      await addActivity(db, {
        userId: uid,
        relatedType: "lead",
        relatedId: leadId,
        activityType,
        content: activityContent.trim(),
      });
      setActivityContent("");
      toast.success("Aktivite eklendi");
    } catch (e) {
      console.error(e);
      toast.error("Eklenemedi");
    }
  }

  async function fetchAiInsight() {
    if (!firebaseUser) return;
    setAiBusy(true);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch("/api/ai/lead-insight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leadId, mode: "insight" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "AI yanıtı alınamadı");
        return;
      }
      setAiSummary(String(data.summary ?? ""));
      setAiAction(String(data.suggestedNextAction ?? ""));
      setAiTaskType(coerceTaskType(String(data.suggestedTaskType ?? "")));
      toast.success("Öneri hazır");
    } catch (e) {
      console.error(e);
      toast.error("İstek başarısız");
    } finally {
      setAiBusy(false);
    }
  }

  async function polishNoteWithAi() {
    if (!firebaseUser || !notes.trim()) {
      toast.error("Önce not yazın");
      return;
    }
    setAiBusy(true);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch("/api/ai/lead-insight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leadId,
          mode: "polish_note",
          noteText: notes,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "AI yanıtı alınamadı");
        return;
      }
      setPolishDraft(String(data.polishedNote ?? ""));
      toast.success("Taslak hazır");
    } catch (e) {
      console.error(e);
      toast.error("İstek başarısız");
    } finally {
      setAiBusy(false);
    }
  }

  async function sendEmailOutbound() {
    if (!firebaseUser || !emailSubject.trim() || !emailBody.trim()) return;
    setChannelBusy(true);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leadId,
          subject: emailSubject.trim(),
          text: emailBody.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Gönderilemedi");
        return;
      }
      toast.success("E-posta gönderildi");
      setEmailOpen(false);
      setEmailSubject("");
      setEmailBody("");
    } catch (e) {
      console.error(e);
      toast.error("İstek başarısız");
    } finally {
      setChannelBusy(false);
    }
  }

  async function sendWhatsAppOutbound() {
    if (!firebaseUser || !waBody.trim()) return;
    setChannelBusy(true);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leadId, message: waBody.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Gönderilemedi");
        return;
      }
      toast.success("WhatsApp gönderildi");
      setWaOpen(false);
      setWaBody("");
    } catch (e) {
      console.error(e);
      toast.error("İstek başarısız");
    } finally {
      setChannelBusy(false);
    }
  }

  async function createTaskFromAi() {
    if (!uid || !aiAction.trim()) {
      toast.error("Önce AI önerisi alın");
      return;
    }
    try {
      const db = getFirebaseDb();
      await createTask(db, {
        relatedType: "lead",
        relatedId: leadId,
        assignedTo: uid,
        title: aiAction.trim().slice(0, 200),
        taskType: aiTaskType,
        dueDate: null,
        priority: "medium",
      });
      toast.success("Görev oluşturuldu");
    } catch (e) {
      console.error(e);
      toast.error("Görev oluşturulamadı");
    }
  }

  async function addTaskRow() {
    if (!uid || !taskTitle.trim()) return;
    try {
      const db = getFirebaseDb();
      await createTask(db, {
        relatedType: "lead",
        relatedId: leadId,
        assignedTo: uid,
        title: taskTitle.trim(),
        dueDate: taskDue ? new Date(taskDue) : null,
        priority: "medium",
      });
      setTaskTitle("");
      setTaskDue("");
      toast.success("Görev oluşturuldu");
    } catch (e) {
      console.error(e);
      toast.error("Oluşturulamadı");
    }
  }

  if (leadLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="size-8 animate-pulse rounded-full bg-primary/20" />
      </div>
    );
  }

  if (!lead) {
    return (
      <p className="text-sm text-muted-foreground">Lead bulunamadı veya erişim yok.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
            {lead.name}
          </h2>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge variant="secondary">{LABELS.leadType[lead.type]}</Badge>
            <Badge variant="outline">{LABELS.source[lead.source]}</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="activities">Aktiviteler</TabsTrigger>
          <TabsTrigger value="tasks">Görevler</TabsTrigger>
          <TabsTrigger value="notes">Notlar</TabsTrigger>
          <TabsTrigger value="enrollment">Kayıt / ödeme</TabsTrigger>
          <TabsTrigger value="ai">AI yardım</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">İletişim</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground">E-posta</p>
                <p>{lead.email ?? "—"}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={!lead.email?.trim()}
                  onClick={() => setEmailOpen(true)}
                >
                  E-posta gönder
                </Button>
              </div>
              <div>
                <p className="text-muted-foreground">Telefon</p>
                <p>{lead.phone ?? "—"}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={!lead.phone?.trim() && !lead.whatsapp?.trim()}
                  onClick={() => setWaOpen(true)}
                >
                  WhatsApp gönder
                </Button>
              </div>
              <div>
                <p className="text-muted-foreground">Şehir</p>
                <p>{lead.city ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Son temas</p>
                <p>
                  {lead.lastContactAt
                    ? format(lead.lastContactAt, "d MMMM yyyy HH:mm", { locale: tr })
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
          {lead.type === "education_candidate" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Eğitim aşaması</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {EDUCATION_STAGES.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    size="sm"
                    variant={lead.educationStage === s ? "default" : "outline"}
                    onClick={() => saveStage(s)}
                  >
                    {LABELS.educationStage[s]}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skor & notlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Lead skoru</Label>
                <Input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Notlar</Label>
                <Textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={saveGeneral}>
                  Kaydet
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={aiBusy || !notes.trim()}
                  onClick={() => void polishNoteWithAi()}
                >
                  Notu AI ile düzenle
                </Button>
              </div>
              {polishDraft ? (
                <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
                  <p className="font-medium">AI taslağı</p>
                  <p className="whitespace-pre-wrap">{polishDraft}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNotes(polishDraft);
                      setPolishDraft("");
                      toast.message("Not alanına kopyalandı; Kaydet ile saklayın.");
                    }}
                  >
                    Not alanına aktar
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Özet ve sonraki adım</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Notlar ve son aktivitelere göre kısa özet ve önerilen aksiyon (OpenAI;
                sunucuda API anahtarı gerekir).
              </p>
              <Button
                type="button"
                disabled={aiBusy}
                onClick={() => void fetchAiInsight()}
              >
                {aiBusy ? "Çalışıyor…" : "Öneri üret"}
              </Button>
              {aiSummary ? (
                <div className="space-y-2">
                  <p className="font-medium">Özet</p>
                  <p className="whitespace-pre-wrap rounded-md border bg-card/50 p-3">
                    {aiSummary}
                  </p>
                </div>
              ) : null}
              {aiAction ? (
                <div className="space-y-2">
                  <p className="font-medium">Önerilen aksiyon</p>
                  <p className="whitespace-pre-wrap rounded-md border bg-card/50 p-3">
                    {aiAction}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Label className="text-xs">Görev tipi</Label>
                    <Select
                      value={aiTaskType}
                      onValueChange={(v) => v && setAiTaskType(coerceTaskType(v))}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {LABELS.taskType[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="secondary" onClick={() => void createTaskFromAi()}>
                      Görev oluştur
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Yeni aktivite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={activityType}
                onValueChange={(v) => v && setActivityType(v as ActivityType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {LABELS.activityType[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                rows={3}
                placeholder="Ne yapıldı?"
                value={activityContent}
                onChange={(e) => setActivityContent(e.target.value)}
              />
              <Button type="button" onClick={addActivityRow}>
                Ekle
              </Button>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {activities.map((a) => (
              <div key={a.id} className="rounded-lg border bg-card/50 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {a.activityDate
                      ? format(a.activityDate, "d MMM yyyy HH:mm", { locale: tr })
                      : "—"}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {LABELS.activityType[a.activityType]}
                  </Badge>
                </div>
                <p className="mt-2 whitespace-pre-wrap">{a.content}</p>
              </div>
            ))}
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz aktivite yok.</p>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Yeni görev</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Başlık"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
              <Input
                type="datetime-local"
                value={taskDue}
                onChange={(e) => setTaskDue(e.target.value)}
              />
              <Button type="button" onClick={addTaskRow}>
                Oluştur
              </Button>
            </CardContent>
          </Card>
          <div className="space-y-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.dueDate
                      ? format(t.dueDate, "d MMM yyyy HH:mm", { locale: tr })
                      : "Tarih yok"}
                    {" · "}
                    {t.status}
                  </p>
                </div>
                {t.status === "open" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const db = getFirebaseDb();
                        await completeTask(db, t.id);
                        toast.success("Tamamlandı");
                      } catch (e) {
                        console.error(e);
                        toast.error("İşlem başarısız");
                      }
                    }}
                  >
                    Tamamla
                  </Button>
                ) : null}
              </div>
            ))}
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Bu lead için görev yok.</p>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Textarea rows={8} value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Button type="button" onClick={saveGeneral}>
                Notları kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollment" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-base">Program kayıtları</CardTitle>
              <Link
                href="/programs"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Programlar
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Bu lead&apos;in kayıtlı olduğu programlar ve ödeme durumu. Yeni kayıt
                eklemek için ilgili program sayfasını açın.
              </p>
              <div className="space-y-2">
                {enrollments.map((en) => (
                  <div
                    key={en.id}
                    className="flex flex-col gap-2 rounded-lg border bg-card/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {programTitleById.get(en.programId) ?? "Program"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {en.joinedAt
                          ? `Kayıt: ${format(en.joinedAt, "d MMM yyyy", { locale: tr })}`
                          : "Kayıt tarihi yok"}
                        {en.paymentAmount != null
                          ? ` · ${en.paymentAmount.toLocaleString("tr-TR")} ₺`
                          : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        {LABELS.paymentStatus[en.paymentStatus]}
                      </Badge>
                      <Link
                        href={`/programs/${en.programId}`}
                        className={cn(
                          buttonVariants({ variant: "secondary", size: "sm" })
                        )}
                      >
                        Programa git
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {enrollments.length === 0 ? (
                <p className="text-muted-foreground">
                  Henüz bir programa kayıt yok.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>E-posta gönder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-2">
              <Label>Konu</Label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Konu"
              />
            </div>
            <div className="space-y-2">
              <Label>Metin</Label>
              <Textarea
                rows={6}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Mesajınız…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              disabled={channelBusy}
              onClick={() => void sendEmailOutbound()}
            >
              {channelBusy ? "Gönderiliyor…" : "Gönder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={waOpen} onOpenChange={setWaOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>WhatsApp mesajı</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Meta politikası: sohbet penceresi dışında şablon mesajı gerekir. Test
            hesabında düz metin çalışabilir.
          </p>
          <div className="space-y-2 py-2">
            <Label>Mesaj</Label>
            <Textarea
              rows={5}
              value={waBody}
              onChange={(e) => setWaBody(e.target.value)}
              placeholder="Mesajınız…"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              disabled={channelBusy}
              onClick={() => void sendWhatsAppOutbound()}
            >
              {channelBusy ? "Gönderiliyor…" : "Gönder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
