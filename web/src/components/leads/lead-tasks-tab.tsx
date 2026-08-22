"use client";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Task } from "@/types/models";

export function LeadTasksTab({
  tasks,
  taskTitle,
  setTaskTitle,
  taskDue,
  setTaskDue,
  onCreate,
  onComplete,
}: {
  tasks: Task[];
  taskTitle: string;
  setTaskTitle: (v: string) => void;
  taskDue: string;
  setTaskDue: (v: string) => void;
  onCreate: () => void;
  onComplete: (taskId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Yeni görev</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="lead-task-title">Görev başlığı</Label>
            <Input
              id="lead-task-title"
              placeholder="Başlık"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-task-due">Bitiş tarihi / saati</Label>
            <Input
              id="lead-task-due"
              type="datetime-local"
              value={taskDue}
              onChange={(e) => setTaskDue(e.target.value)}
            />
          </div>
          <Button type="button" onClick={onCreate}>
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
                onClick={() => onComplete(t.id)}
                aria-label={`"${t.title}" görevini tamamla`}
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
    </div>
  );
}
