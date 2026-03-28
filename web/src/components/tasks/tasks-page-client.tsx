"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useAuth } from "@/contexts/auth-context";
import { getFirebaseDb } from "@/lib/firebase/client";
import { subscribeLeadsForUser } from "@/lib/firestore/leads";
import { completeTask, createTask, subscribeTasksForUser } from "@/lib/firestore/tasks";
import type { Lead, Task } from "@/types/models";

export function TasksPageClient() {
  const { firebaseUser, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [leadId, setLeadId] = useState<string>("");
  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";

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

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!uid || !title.trim() || !leadId) {
      toast.error("Başlık ve lead seçin");
      return;
    }
    try {
      const db = getFirebaseDb();
      await createTask(db, {
        relatedType: "lead",
        relatedId: leadId,
        assignedTo: uid,
        title: title.trim(),
        dueDate: due ? new Date(due) : null,
        priority: "medium",
      });
      toast.success("Görev oluşturuldu");
      setOpen(false);
      setTitle("");
      setDue("");
      setLeadId("");
    } catch (err) {
      console.error(err);
      toast.error("Oluşturulamadı");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
            Görevler
          </h2>
          <p className="text-sm text-muted-foreground">
            Atanan görevler ve hızlı oluşturma.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button type="button" onClick={() => setOpen(true)}>
            Yeni görev
          </Button>
          <DialogContent>
            <form onSubmit={onCreate}>
              <DialogHeader>
                <DialogTitle>Yeni görev</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                <div className="space-y-2">
                  <Label>Başlık</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bağlı lead</Label>
                  <Select
                    value={leadId}
                    onValueChange={(v) => setLeadId(v ?? "")}
                    required
                  >
                    <SelectTrigger>
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
                </div>
                <div className="space-y-2">
                  <Label>Bitiş (opsiyonel)</Label>
                  <Input
                    type="datetime-local"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Oluştur</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {tasks.map((t) => (
          <Card key={t.id} className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">{t.title}</CardTitle>
              <Badge variant={t.status === "open" ? "default" : "secondary"}>
                {t.status}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>
                Bitiş:{" "}
                {t.dueDate
                  ? format(t.dueDate, "d MMM yyyy HH:mm", { locale: tr })
                  : "—"}
              </span>
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
            </CardContent>
          </Card>
        ))}
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Görev yok.</p>
        ) : null}
      </div>
    </div>
  );
}
