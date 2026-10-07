"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import { ClipboardList, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { getFirebaseDb } from "@/lib/firebase/client";
import { addActivity, subscribeRecentActivities } from "@/lib/firestore/activities";
import { createTask, subscribeTasksForUser } from "@/lib/firestore/tasks";
import { subscribeLeadsForUser } from "@/lib/firestore/leads";
import { LABELS } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Activity, Lead, Task } from "@/types/models";

export function GlobalRightRail() {
  const { firebaseUser, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [quickTask, setQuickTask] = useState("");
  const [quickNote, setQuickNote] = useState("");
  const [quickLeadId, setQuickLeadId] = useState("");
  const [taskBusy, setTaskBusy] = useState(false);
  const [noteBusy, setNoteBusy] = useState(false);
  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    const u1 = subscribeTasksForUser(db, uid, isAdmin, setTasks);
    const u0 = subscribeLeadsForUser(db, uid, isAdmin, setLeads);
    const u2 = subscribeRecentActivities(
      db,
      { isAdmin, userId: uid, max: 15 },
      setActivities
    );
    return () => {
      u0();
      u1();
      u2();
    };
  }, [uid, isAdmin]);

  const todayTasks = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return tasks.filter(
      (t) =>
        t.status === "open" &&
        t.dueDate &&
        t.dueDate >= start &&
        t.dueDate < end
    );
  }, [tasks]);

  async function submitQuickTask() {
    if (!uid || !quickTask.trim() || !quickLeadId) {
      toast.error("Lead seçin ve başlık girin");
      return;
    }
    setTaskBusy(true);
    try {
      const db = getFirebaseDb();
      await createTask(db, {
        relatedType: "lead",
        relatedId: quickLeadId,
        assignedTo: uid,
        title: quickTask.trim(),
        dueDate: new Date(),
        priority: "medium",
      });
      toast.success("Görev oluşturuldu");
      setQuickTask("");
    } catch (e) {
      console.error(e);
      toast.error("Oluşturulamadı");
    } finally {
      setTaskBusy(false);
    }
  }

  async function submitQuickNote() {
    if (!uid || !quickNote.trim() || !quickLeadId) {
      toast.error("Lead seçin ve not girin");
      return;
    }
    setNoteBusy(true);
    try {
      const db = getFirebaseDb();
      await addActivity(db, {
        userId: uid,
        relatedType: "lead",
        relatedId: quickLeadId,
        activityType: "note",
        content: quickNote.trim(),
      });
      toast.success("Not kaydedildi");
      setQuickNote("");
    } catch (e) {
      console.error(e);
      toast.error("Kaydedilemedi");
    } finally {
      setNoteBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" />
            Hızlı işlemler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="quick-lead-select">Lead</Label>
            <Select value={quickLeadId} onValueChange={(v) => setQuickLeadId(v ?? "")}>
              <SelectTrigger id="quick-lead-select" aria-label="Lead seçimi">
                <SelectValue placeholder="Lead seçin" />
              </SelectTrigger>
              <SelectContent>
                {leads.slice(0, 30).map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quick-task">Hızlı görev</Label>
            <Input
              id="quick-task"
              value={quickTask}
              onChange={(e) => setQuickTask(e.target.value)}
              placeholder="Bugün yapılacak…"
            />
            <Button
              type="button"
              size="sm"
              className="w-full"
              disabled={taskBusy}
              onClick={() => void submitQuickTask()}
            >
              {taskBusy ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden="true" />
                  Ekleniyor…
                </>
              ) : (
                "Görev ekle"
              )}
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quick-note">Hızlı not</Label>
            <Textarea
              id="quick-note"
              rows={2}
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              placeholder="Kısa not…"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              disabled={noteBusy}
              onClick={() => void submitQuickNote()}
            >
              {noteBusy ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden="true" />
                  Kaydediliyor…
                </>
              ) : (
                "Not kaydet"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Bugünkü hatırlatmalar ({todayTasks.length})
        </p>
        {todayTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground">Bugün için görev yok.</p>
        ) : (
          <ul className="space-y-1 text-xs">
            {todayTasks.slice(0, 5).map((t) => (
              <li key={t.id}>
                <Link href="/tasks" className="hover:underline">
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Separator />

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Son aktiviteler
        </p>
        {activities.length === 0 ? (
          <p className="text-xs text-muted-foreground">Henüz aktivite yok.</p>
        ) : (
          <ul className="space-y-2 text-xs">
            {activities.slice(0, 5).map((a) => (
              <li key={a.id} className="rounded-md border bg-card/50 p-2">
                <span className="text-muted-foreground">
                  {a.activityDate
                    ? format(a.activityDate, "d MMM HH:mm", { locale: tr })
                    : "—"}
                  {" · "}
                  {LABELS.activityType[a.activityType]}
                </span>
                <p className="mt-0.5 line-clamp-2">{a.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href="/tasks"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "w-full justify-start"
        )}
      >
        <ClipboardList className="mr-2 size-4" />
        Görev listesi
      </Link>
    </div>
  );
}
