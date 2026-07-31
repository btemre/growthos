"use client";

import { useEffect, useMemo, useState, memo } from "react";
import {
  endOfDay,
  format,
  isAfter,
  isBefore,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { tr } from "date-fns/locale";
import {
  AlertTriangle,
  Clock,
  Flame,
  Phone,
  Target,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/contexts/auth-context";
import { getFirebaseDb } from "@/lib/firebase/client";
import { subscribeRecentActivities } from "@/lib/firestore/activities";
import { subscribeLeadsForUser } from "@/lib/firestore/leads";
import { subscribeTasksForUser } from "@/lib/firestore/tasks";
import { subscribeDealsForUser } from "@/lib/firestore/deals";
import type { Activity, Deal, Lead, Task } from "@/types/models";

// Memoize KpiCard to prevent unnecessary re-renders of KPI elements when parent state changes.
const KpiCard = memo(function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon: typeof UserPlus;
  href?: string;
}) {
  const inner = (
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
  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
        {inner}
      </Link>
    );
  }
  return inner;
});

export function DashboardHome() {
  const { firebaseUser, profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const isAdmin = profile?.role === "admin";
  const uid = firebaseUser?.uid ?? "";

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    const unsubL = subscribeLeadsForUser(db, uid, isAdmin, setLeads);
    const unsubT = subscribeTasksForUser(db, uid, isAdmin, setTasks);
    const unsubD = subscribeDealsForUser(db, uid, isAdmin, setDeals);
    const unsubA = subscribeRecentActivities(
      db,
      { isAdmin, userId: uid, max: 50 },
      setActivities
    );
    return () => {
      unsubL();
      unsubT();
      unsubD();
      unsubA();
    };
  }, [uid, isAdmin]);

  // Calculate todayKey to stabilize the useMemo dependency across calendar days.
  // By avoiding unstable Date objects in the dependency array, we avoid rendering cascade-triggered re-renders.
  const todayKey = format(new Date(), "yyyy-MM-dd");

  const stats = useMemo(() => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const weekAgo = startOfDay(subDays(today, 7));
    const monthStart = startOfMonth(today);
    const hotSilentLimit = subDays(today, 3);

    let leadsToday = 0;
    let enrolledThisMonth = 0;
    let closedSalesWeek = 0;
    const hotSilent: Lead[] = [];
    const awaitingPayment: Lead[] = [];

    // Single-pass optimization for leads
    leads.forEach((l) => {
      // 1. Leads Today
      if (l.createdAt) {
        const c = l.createdAt;
        if (!isBefore(c, todayStart) && !isAfter(c, todayEnd)) {
          leadsToday++;
        }
      }

      // 2. Stage-based metrics
      if (l.educationStage === "enrolled") {
        if (l.updatedAt) {
          const u = l.updatedAt;
          if (!isBefore(u, monthStart)) {
            enrolledThisMonth++;
          }
          if (!isBefore(u, weekAgo)) {
            closedSalesWeek++;
          }
        }
      } else if (l.educationStage === "awaiting_payment") {
        awaitingPayment.push(l);
      }

      // 3. Hot silent leads
      if (l.type === "education_candidate" && l.score >= 50) {
        const last = l.lastContactAt;
        if (!last || isBefore(last, hotSilentLimit)) {
          hotSilent.push(l);
        }
      }
    });

    // Single-pass optimization for activities
    let callsToday = 0;
    activities.forEach((a) => {
      if (a.activityType === "phone_call" && a.activityDate) {
        const d = a.activityDate;
        if (!isBefore(d, todayStart) && !isAfter(d, todayEnd)) {
          callsToday++;
        }
      }
    });

    // Single-pass optimization for tasks
    let followUpsToday = 0;
    const overdueTasks: Task[] = [];
    tasks.forEach((t) => {
      if (t.status === "open" && t.dueDate) {
        const due = t.dueDate;
        if (!isBefore(due, todayStart) && !isAfter(due, todayEnd)) {
          followUpsToday++;
        }
        if (isBefore(due, todayStart)) {
          overdueTasks.push(t);
        }
      }
    });

    // Single-pass optimization for deals
    let corpOpenedMonth = 0;
    let pipelineValue = 0;
    deals.forEach((d) => {
      pipelineValue += d.estimatedValue ?? 0;
      if (d.createdAt) {
        const c = d.createdAt;
        if (!isBefore(c, monthStart)) {
          corpOpenedMonth++;
        }
      }
    });

    return {
      leadsToday,
      callsToday,
      followUpsToday,
      enrolledThisMonth,
      closedSalesWeek,
      corpOpenedMonth,
      pipelineValue,
      hotSilent,
      awaitingPayment,
      overdueTasks,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, tasks, deals, activities, todayKey]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Genel bakış"
        description="Bugünkü hareket, pipeline ve dikkat gerektiren kayıtlar."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Bugün eklenen lead"
          value={stats.leadsToday}
          icon={UserPlus}
          href="/leads"
        />
        <KpiCard
          title="Bugünkü arama"
          value={stats.callsToday}
          icon={Phone}
        />
        <KpiCard
          title="Bugün planlanan follow-up"
          value={stats.followUpsToday}
          icon={Target}
          href="/tasks"
        />
        <KpiCard
          title="Bu hafta kayıt (eğitim)"
          value={stats.closedSalesWeek}
          icon={TrendingUp}
          href="/pipeline/education"
        />
        <KpiCard
          title="Bu ay kayıt olan öğrenci"
          value={stats.enrolledThisMonth}
          icon={TrendingUp}
        />
        <KpiCard
          title="Bu ay yeni kurumsal fırsat"
          value={stats.corpOpenedMonth}
          icon={TrendingUp}
          href="/pipeline/corporate"
        />
        <KpiCard
          title="Tahmini pipeline (kurumsal)"
          value={
            stats.pipelineValue >= 1_000_000
              ? `${(stats.pipelineValue / 1_000_000).toFixed(1)}M ₺`
              : `${stats.pipelineValue.toLocaleString("tr-TR")} ₺`
          }
          icon={TrendingUp}
          href="/pipeline/corporate"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <Clock className="size-4" />
              Geciken görevler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {stats.overdueTasks.length === 0 ? (
              <p className="text-muted-foreground">Geciken görev yok.</p>
            ) : (
              <ul className="space-y-1">
                {stats.overdueTasks.slice(0, 5).map((t) => (
                  <li key={t.id}>
                    <Link href="/tasks?filter=overdue" className="hover:underline">
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {stats.overdueTasks.length > 0 ? (
              <Link
                href="/tasks?filter=overdue"
                className="text-xs font-medium text-primary hover:underline"
              >
                Tüm geciken görevler →
              </Link>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-[var(--semantic-warning)]/40 bg-[var(--semantic-warning)]/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-[var(--semantic-warning)]" />
              Ödeme bekliyor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {stats.awaitingPayment.length === 0 ? (
              <p className="text-muted-foreground">Ödeme bekleyen aday yok.</p>
            ) : (
              stats.awaitingPayment.slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-2">
                  <Link href={`/leads/${l.id}`} className="hover:underline">
                    {l.name}
                  </Link>
                  <StatusBadge tone="warning">Ödeme</StatusBadge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--semantic-hot)]/30 bg-[var(--semantic-hot)]/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="size-4 text-[var(--semantic-hot)]" />
              Sessiz sıcak lead (3+ gün)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {stats.hotSilent.length === 0 ? (
              <p className="text-muted-foreground">Kritik sıcak lead yok.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {stats.hotSilent.slice(0, 6).map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/leads/${l.id}`}
                      className="font-medium hover:underline"
                    >
                      {l.name}
                    </Link>
                    <StatusBadge tone="hot" className="ml-2">
                      skor {l.score}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            )}
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
