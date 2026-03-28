"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { ACTIVITY_TYPES, EDUCATION_STAGES, LABELS } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { addActivity, subscribeActivitiesForRelated } from "@/lib/firestore/activities";
import { subscribeTasksForUser, createTask, completeTask } from "@/lib/firestore/tasks";
import { updateLead } from "@/lib/firestore/leads";
import { leadFromDoc } from "@/lib/firestore/serialize";
import type { Activity, EducationStage, Lead, Task } from "@/types/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActivityType } from "@/types/models";

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
  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";

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
          <TabsTrigger value="more" disabled>
            Teklif / ödeme (Faz 2)
          </TabsTrigger>
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
              </div>
              <div>
                <p className="text-muted-foreground">Telefon</p>
                <p>{lead.phone ?? "—"}</p>
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
              <Button type="button" onClick={saveGeneral}>
                Kaydet
              </Button>
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
      </Tabs>
    </div>
  );
}
