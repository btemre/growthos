"use client";

import { useEffect, useMemo, useState } from "react";
import {
  endOfDay,
  format,
  isAfter,
  isBefore,
  startOfDay,
  subDays,
} from "date-fns";
import { tr } from "date-fns/locale";
import {
  AlertTriangle,
  Flame,
  Phone,
  Target,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { getFirebaseDb } from "@/lib/firebase/client";
import { subscribeLeadsForUser } from "@/lib/firestore/leads";
import { subscribeTasksForUser } from "@/lib/firestore/tasks";
import { subscribeDealsForUser } from "@/lib/firestore/deals";
import type { Deal, Lead, Task } from "@/types/models";

function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon: typeof UserPlus;
}) {
  return (
    <Card className="overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-4 text-primary/80" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function DashboardHome() {
  const { firebaseUser, profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  const isAdmin = profile?.role === "admin";
  const uid = firebaseUser?.uid ?? "";

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    const unsubL = subscribeLeadsForUser(db, uid, isAdmin, setLeads);
    const unsubT = subscribeTasksForUser(db, uid, isAdmin, setTasks);
    const unsubD = subscribeDealsForUser(db, uid, isAdmin, setDeals);
    return () => {
      unsubL();
      unsubT();
      unsubD();
    };
  }, [uid, isAdmin]);

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const weekAgo = startOfDay(subDays(new Date(), 7));

  const stats = useMemo(() => {
    const leadsToday = leads.filter((l) => {
      const c = l.createdAt;
      if (!c) return false;
      return !isBefore(c, todayStart) && !isAfter(c, todayEnd);
    }).length;

    const callsToday = 0;

    const followUpsToday = tasks.filter(
      (t) =>
        t.status === "open" &&
        t.dueDate &&
        !isBefore(t.dueDate, todayStart) &&
        !isAfter(t.dueDate, todayEnd)
    ).length;

    const closedSalesWeek = leads.filter((l) => {
      if (l.educationStage !== "enrolled") return false;
      const u = l.updatedAt;
      if (!u) return false;
      return !isBefore(u, weekAgo);
    }).length;

    const corpOpenedMonth = deals.filter((d) => {
      const c = d.createdAt;
      if (!c) return false;
      return !isBefore(c, startOfDay(subDays(new Date(), 30)));
    }).length;

    const pipelineValue = deals.reduce((acc, d) => acc + (d.estimatedValue ?? 0), 0);

    const hotSilent = leads.filter((l) => {
      if (l.type !== "education_candidate") return false;
      if (l.score < 50) return false;
      const last = l.lastContactAt;
      if (!last) return true;
      return isBefore(last, subDays(new Date(), 3));
    });

    const overdueTasks = tasks.filter(
      (t) =>
        t.status === "open" &&
        t.dueDate &&
        isBefore(t.dueDate, todayStart)
    );

    return {
      leadsToday,
      callsToday,
      followUpsToday,
      closedSalesWeek,
      corpOpenedMonth,
      pipelineValue,
      hotSilent,
      overdueTasks,
    };
  }, [leads, tasks, deals, todayStart, todayEnd, weekAgo]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-tight">
          Genel bakış
        </h2>
        <p className="text-sm text-muted-foreground">
          Bugünkü hareket, pipeline ve dikkat gerektiren kayıtlar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Bugün eklenen lead"
          value={stats.leadsToday}
          icon={UserPlus}
        />
        <KpiCard
          title="Bugünkü arama (MVP)"
          value={stats.callsToday}
          hint="Aktivite türü ile doldurulunca otomatik hesaplanır."
          icon={Phone}
        />
        <KpiCard
          title="Bugün planlanan follow-up"
          value={stats.followUpsToday}
          icon={Target}
        />
        <KpiCard
          title="Bu hafta kayıt (eğitim)"
          value={stats.closedSalesWeek}
          icon={TrendingUp}
        />
        <KpiCard
          title="Bu ay yeni kurumsal fırsat"
          value={stats.corpOpenedMonth}
          icon={TrendingUp}
        />
        <KpiCard
          title="Tahmini pipeline (kurumsal)"
          value={
            stats.pipelineValue >= 1_000_000
              ? `${(stats.pipelineValue / 1_000_000).toFixed(1)}M ₺`
              : `${stats.pipelineValue.toLocaleString("tr-TR")} ₺`
          }
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-600" />
              Uyarılar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {stats.overdueTasks.length === 0 && stats.hotSilent.length === 0 ? (
              <p className="text-muted-foreground">Şu an kritik uyarı yok.</p>
            ) : null}
            {stats.overdueTasks.length > 0 ? (
              <div>
                <p className="font-medium">Geciken görevler</p>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {stats.overdueTasks.slice(0, 5).map((t) => (
                    <li key={t.id}>
                      <Link href="/tasks" className="hover:underline">
                        {t.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {stats.hotSilent.length > 0 ? (
              <div>
                <p className="flex items-center gap-2 font-medium">
                  <Flame className="size-4 text-[var(--semantic-hot)]" />
                  Sessiz sıcak lead (3+ gün)
                </p>
                <ul className="mt-1 space-y-1">
                  {stats.hotSilent.slice(0, 5).map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/leads/${l.id}`}
                        className="text-muted-foreground hover:underline"
                      >
                        {l.name}
                      </Link>
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        skor {l.score}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bugünkü görevler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {tasks.filter((t) => t.status === "open").length === 0 ? (
              <p className="text-muted-foreground">Açık görev yok.</p>
            ) : (
              tasks
                .filter((t) => t.status === "open")
                .slice(0, 6)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-card/50 px-3 py-2"
                  >
                    <span className="truncate font-medium">{t.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {t.dueDate
                        ? format(t.dueDate, "d MMM", { locale: tr })
                        : "—"}
                    </span>
                  </div>
                ))
            )}
            <Link
              href="/tasks"
              className="inline-block pt-2 text-xs font-medium text-primary hover:underline"
            >
              Tüm görevler →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
