"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { addDays, format, isBefore, startOfDay, startOfWeek, endOfWeek } from "date-fns";
import { tr } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge, taskPriorityTone } from "@/components/shared/status-badge";
import { useAuth } from "@/contexts/auth-context";
import { getFirebaseDb } from "@/lib/firebase/client";
import { subscribeLeadsForUser } from "@/lib/firestore/leads";
import { completeTask, createTask, subscribeTasksForUser } from "@/lib/firestore/tasks";
import { taskFormSchema, type TaskFormValues } from "@/lib/schemas/task";
import type { Lead, Task } from "@/types/models";

function TaskRow({
  task,
  onComplete,
}: {
  task: Task;
  onComplete: () => void;
}) {
  return (
    <Card className="border-border/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{task.title}</CardTitle>
        <div className="flex items-center gap-2">
          <StatusBadge tone={taskPriorityTone(task.priority)}>
            {task.priority ?? "medium"}
          </StatusBadge>
          <Badge variant={task.status === "open" ? "default" : "secondary"}>
            {task.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          Bitiş:{" "}
          {task.dueDate
            ? format(task.dueDate, "d MMM yyyy HH:mm", { locale: tr })
            : "—"}
        </span>
        {task.status === "open" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onComplete}
            aria-label={`"${task.title}" görevini tamamla`}
          >
            Tamamla
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function TasksPageClient() {
  const searchParams = useSearchParams();
  const filterOverdue = searchParams.get("filter") === "overdue";
  const { firebaseUser, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [open, setOpen] = useState(false);
  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      dueDate: "",
      leadId: "",
      priority: "medium",
    },
  });

  const leadId = watch("leadId");

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    const u1 = subscribeTasksForUser(db, uid, isAdmin, setTasks);
    const u2 = subscribeLeadsForUser(db, uid, isAdmin, setLeads);
    return () => {
      u1();
      u2();
    };
  }, [uid, isAdmin]);

  const educationLeads = useMemo(
    () => leads.filter((l) => l.type === "education_candidate"),
    [leads]
  );

  const todayStart = startOfDay(new Date());
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const grouped = useMemo(() => {
    let list = tasks;
    if (filterOverdue) {
      list = list.filter(
        (t) =>
          t.status === "open" && t.dueDate && isBefore(t.dueDate, todayStart)
      );
    }
    const overdue = list.filter(
      (t) =>
        t.status === "open" && t.dueDate && isBefore(t.dueDate, todayStart)
    );
    const todayEnd = addDays(todayStart, 1);
    const today = list.filter(
      (t) =>
        t.status === "open" &&
        t.dueDate &&
        !isBefore(t.dueDate, todayStart) &&
        isBefore(t.dueDate, todayEnd)
    );
    const todayIds = new Set(today.map((t) => t.id));
    const overdueIds = new Set(overdue.map((t) => t.id));
    const thisWeek = list.filter(
      (t) =>
        t.status === "open" &&
        t.dueDate &&
        !isBefore(t.dueDate, weekStart) &&
        !isBefore(weekEnd, t.dueDate) &&
        !todayIds.has(t.id) &&
        !overdueIds.has(t.id)
    );
    const weekIds = new Set(thisWeek.map((t) => t.id));
    const later = list.filter(
      (t) =>
        t.status === "open" &&
        !overdueIds.has(t.id) &&
        !todayIds.has(t.id) &&
        !weekIds.has(t.id)
    );
    return { overdue, today, thisWeek, later, all: list };
  }, [tasks, todayStart, weekStart, weekEnd, filterOverdue]);

  async function onCreate(values: TaskFormValues) {
    if (!uid) return;
    try {
      const db = getFirebaseDb();
      await createTask(db, {
        relatedType: "lead",
        relatedId: values.leadId,
        assignedTo: uid,
        title: values.title.trim(),
        dueDate: values.dueDate ? new Date(values.dueDate) : null,
        priority: values.priority,
      });
      toast.success("Görev oluşturuldu");
      setOpen(false);
      reset();
    } catch (err) {
      console.error(err);
      toast.error("Oluşturulamadı");
    }
  }

  async function complete(t: Task) {
    try {
      const db = getFirebaseDb();
      await completeTask(db, t.id);
      toast.success("Tamamlandı");
    } catch (e) {
      console.error(e);
      toast.error("İşlem başarısız");
    }
  }

  const sections = filterOverdue
    ? [{ title: "Geciken", items: grouped.overdue }]
    : [
        { title: "Geciken", items: grouped.overdue },
        { title: "Bugün", items: grouped.today },
        { title: "Bu hafta", items: grouped.thisWeek },
        { title: "Diğer açık", items: grouped.later },
      ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Görevler"
        description="Atanan görevler; önceliğe göre gruplandı."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <Button type="button" onClick={() => setOpen(true)}>
              Yeni görev
            </Button>
            <DialogContent>
              <form onSubmit={handleSubmit(onCreate)}>
                <DialogHeader>
                  <DialogTitle>Yeni görev</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Başlık</Label>
                    <Input id="task-title" {...register("title")} />
                    {errors.title ? (
                      <p className="text-xs text-destructive">{errors.title.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-lead">Bağlı lead</Label>
                    <Select
                      value={leadId}
                      onValueChange={(v) => setValue("leadId", v ?? "")}
                    >
                      <SelectTrigger id="task-lead">
                        <SelectValue placeholder="Lead seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationLeads.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.leadId ? (
                      <p className="text-xs text-destructive">{errors.leadId.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-due-date">Bitiş</Label>
                    <Input id="task-due-date" type="datetime-local" {...register("dueDate")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-priority">Öncelik</Label>
                    <Select
                      value={watch("priority")}
                      onValueChange={(v) =>
                        setValue("priority", (v as "low" | "medium" | "high") ?? "medium")
                      }
                    >
                      <SelectTrigger id="task-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Düşük</SelectItem>
                        <SelectItem value="medium">Orta</SelectItem>
                        <SelectItem value="high">Yüksek</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    Oluştur
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {sections.map(
        (sec) =>
          sec.items.length > 0 && (
            <div key={sec.title} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {sec.title} ({sec.items.length})
              </h3>
              <div className="grid gap-3">
                {sec.items.map((t) => (
                  <TaskRow key={t.id} task={t} onComplete={() => void complete(t)} />
                ))}
              </div>
            </div>
          )
      )}

      {grouped.all.length === 0 ? (
        <EmptyState
          title="Görev yok"
          description="Yeni görev oluşturun veya filtreleri kontrol edin."
        />
      ) : null}
    </div>
  );
}
