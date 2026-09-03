"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/contexts/auth-context";
import { getFirebaseDb } from "@/lib/firebase/client";
import { subscribeTasksForUser } from "@/lib/firestore/tasks";
import { subscribeLeadsForUser } from "@/lib/firestore/leads";
import type { Lead, Task } from "@/types/models";

type CalEvent = {
  id: string;
  date: Date;
  title: string;
  href: string;
  kind: "task" | "lead";
};

export function CalendarPageClient() {
  const { firebaseUser, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
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

  const events = useMemo(() => {
    const list: CalEvent[] = [];
    for (const t of tasks) {
      if (!t.dueDate || t.status !== "open") continue;
      list.push({
        id: `task-${t.id}`,
        date: t.dueDate,
        title: t.title,
        href: "/tasks",
        kind: "task",
      });
    }
    for (const l of leads) {
      if (!l.nextActionAt) continue;
      list.push({
        id: `lead-${l.id}`,
        date: l.nextActionAt,
        title: `${l.name} — aksiyon`,
        href: `/leads/${l.id}`,
        kind: "lead",
      });
    }
    return list;
  }, [tasks, leads]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = startOfWeek(addDays(monthEnd, 6), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: addDays(gridEnd, 6) });

  const selectedDayEvents = events.filter((e) =>
    isSameDay(e.date, selectedDay)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Takvim"
        description="Görev bitiş tarihleri ve lead sıradaki aksiyonları."
      />

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setViewMonth((c) => addDays(startOfMonth(c), -1))}
          aria-label="Önceki ay"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <h3 className="text-lg font-semibold capitalize">
          {format(viewMonth, "MMMM yyyy", { locale: tr })}
        </h3>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setViewMonth((c) => addDays(endOfMonth(c), 1))}
          aria-label="Sonraki ay"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayEvents = events.filter((e) => isSameDay(e.date, day));
              const inMonth = isSameMonth(day, viewMonth);
              const selected = isSameDay(day, selectedDay);
              const dateLabel = format(day, "d MMMM yyyy", { locale: tr });
              const eventCountLabel =
                dayEvents.length > 0 ? `, ${dayEvents.length} olay` : "";
              const ariaLabel = `${dateLabel}${eventCountLabel}`;

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  aria-pressed={selected}
                  aria-label={ariaLabel}
                  className={`min-h-16 rounded-md border p-1 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    inMonth ? "bg-card" : "bg-muted/30 text-muted-foreground"
                  } ${selected ? "ring-2 ring-primary" : ""}`}
                >
                  <span className="font-medium" aria-hidden="true">
                    {format(day, "d")}
                  </span>
                  {dayEvents.length > 0 ? (
                    <span
                      className="mt-0.5 block truncate text-[10px] text-primary"
                      aria-hidden="true"
                    >
                      {dayEvents.length} olay
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {format(selectedDay, "d MMMM yyyy", { locale: tr })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {selectedDayEvents.length === 0 ? (
            <EmptyState
              title="Bu gün için olay yok"
              description="Görev veya lead aksiyon tarihi ekleyin."
            />
          ) : (
            selectedDayEvents.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
              >
                <span>{e.title}</span>
                <Link href={e.href} className="text-xs text-primary hover:underline">
                  {e.kind === "task" ? "Görevler" : "Lead"}
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
