"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useUserDirectory } from "@/hooks/use-user-directory";
import { TASK_TYPES } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { addActivity, subscribeActivitiesForRelated } from "@/lib/firestore/activities";
import { subscribeTasksForRelated, createTask, completeTask } from "@/lib/firestore/tasks";
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
  TaskType,
  ActivityType,
} from "@/types/models";
import { LeadDetailHeader } from "./lead-detail-header";
import { LeadGeneralTab } from "./lead-general-tab";
import { LeadActivitiesTab } from "./lead-activities-tab";
import { LeadTasksTab } from "./lead-tasks-tab";
import { LeadEnrollmentTab } from "./lead-enrollment-tab";
import { LeadChannelDialogs } from "./lead-channel-dialogs";

const LeadAiPanel = dynamic(
  () => import("./lead-ai-panel").then((m) => m.LeadAiPanel),
  {
    loading: () => (
      <div className="space-y-2 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    ),
    ssr: false,
  }
);

function coerceTaskType(raw: string): TaskType {
  const t = raw?.trim();
  if (t && TASK_TYPES.includes(t as TaskType)) return t as TaskType;
  return "follow_up";
}

export function LeadDetailClient({ leadId }: { leadId: string }) {
  const { firebaseUser, profile } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [leadLoading, setLeadLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
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
  const { resolveOwner } = useUserDirectory(isAdmin);

  const programTitleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of programs) m.set(p.id, p.title);
    return m;
  }, [programs]);

  const ownerLabel = lead ? resolveOwner(lead.ownerId, uid) : "";

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
    // Optimization: subscribe directly to tasks for this lead instead of filtering all user tasks
    return subscribeTasksForRelated(db, uid, isAdmin, "lead", leadId, setTasks);
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
      await updateLead(db, lead.id, { notes, score: Number(score) });
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

  async function applyActivityTemplate(type: ActivityType, content: string) {
    if (!uid) return;
    try {
      const db = getFirebaseDb();
      await addActivity(db, {
        userId: uid,
        relatedType: "lead",
        relatedId: leadId,
        activityType: type,
        content,
      });
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
        body: JSON.stringify({ leadId, mode: "polish_note", noteText: notes }),
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

  async function completeTaskById(taskId: string) {
    try {
      const db = getFirebaseDb();
      await completeTask(db, taskId);
      toast.success("Tamamlandı");
    } catch (e) {
      console.error(e);
      toast.error("İşlem başarısız");
    }
  }

  if (leadLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
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
      <LeadDetailHeader lead={lead} ownerLabel={ownerLabel} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="activities">Aktiviteler</TabsTrigger>
          <TabsTrigger value="tasks">Görevler</TabsTrigger>
          <TabsTrigger value="notes">Notlar</TabsTrigger>
          <TabsTrigger value="enrollment">Kayıt / ödeme</TabsTrigger>
          <TabsTrigger value="ai">AI yardım</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <LeadGeneralTab
            lead={lead}
            notes={notes}
            setNotes={setNotes}
            score={score}
            setScore={setScore}
            polishDraft={polishDraft}
            setPolishDraft={setPolishDraft}
            aiBusy={aiBusy}
            onSave={() => void saveGeneral()}
            onSaveStage={(s) => void saveStage(s)}
            onPolishNote={() => void polishNoteWithAi()}
            onOpenEmail={() => setEmailOpen(true)}
            onOpenWhatsApp={() => setWaOpen(true)}
          />
        </TabsContent>

        <TabsContent value="activities">
          <LeadActivitiesTab
            activities={activities}
            activityType={activityType}
            setActivityType={setActivityType}
            activityContent={activityContent}
            setActivityContent={setActivityContent}
            onAdd={() => void addActivityRow()}
            onTemplate={(type, content) => void applyActivityTemplate(type, content)}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <LeadTasksTab
            tasks={tasks}
            taskTitle={taskTitle}
            setTaskTitle={setTaskTitle}
            taskDue={taskDue}
            setTaskDue={setTaskDue}
            onCreate={() => void addTaskRow()}
            onComplete={(id) => void completeTaskById(id)}
          />
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <Textarea rows={8} value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Button type="button" onClick={() => void saveGeneral()}>
                Notları kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollment">
          <LeadEnrollmentTab
            enrollments={enrollments}
            programTitleById={programTitleById}
          />
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          {activeTab === "ai" ? (
            <LeadAiPanel
              aiBusy={aiBusy}
              aiSummary={aiSummary}
              aiAction={aiAction}
              aiTaskType={aiTaskType}
              setAiTaskType={setAiTaskType}
              coerceTaskType={coerceTaskType}
              onFetchInsight={() => void fetchAiInsight()}
              onCreateTask={() => void createTaskFromAi()}
            />
          ) : null}
        </TabsContent>
      </Tabs>

      <LeadChannelDialogs
        emailOpen={emailOpen}
        setEmailOpen={setEmailOpen}
        emailSubject={emailSubject}
        setEmailSubject={setEmailSubject}
        emailBody={emailBody}
        setEmailBody={setEmailBody}
        waOpen={waOpen}
        setWaOpen={setWaOpen}
        waBody={waBody}
        setWaBody={setWaBody}
        channelBusy={channelBusy}
        onSendEmail={() => void sendEmailOutbound()}
        onSendWhatsApp={() => void sendWhatsAppOutbound()}
      />
    </div>
  );
}
