"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  endOfDay,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/contexts/auth-context";
import { downloadCsv, inRange } from "@/lib/report-utils";
import { CORPORATE_DEAL_STAGES, LABELS, LEAD_SOURCES } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { subscribeActivitiesInDateRange } from "@/lib/firestore/activities";
import { subscribeDealsForUser } from "@/lib/firestore/deals";
import { subscribeRecentEnrollments } from "@/lib/firestore/enrollments";
import { subscribeLeadsForUser } from "@/lib/firestore/leads";
import { subscribeProposals } from "@/lib/firestore/proposals";
import { subscribeTasksForUser } from "@/lib/firestore/tasks";
import { listUsers } from "@/lib/firestore/users";
import type {
  Activity,
  AppUser,
  Deal,
  DealStage,
  Enrollment,
  Lead,
  Proposal,
  Task,
} from "@/types/models";

type Preset = "week" | "7d" | "month" | "30d" | "custom";

export function ReportsPageClient() {
  const { firebaseUser, profile } = useAuth();
  const [preset, setPreset] = useState<Preset>("week");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);

  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";
  const isBusinessDev = profile?.role === "business_dev";
  const showCorporate = isAdmin || isBusinessDev;
  const showEnrollmentsBlock =
    isAdmin ||
    profile?.role === "operations" ||
    profile?.role === "mentor" ||
    profile?.role === "education_sales";

  // Stabilize date dependencies using todayKey pattern
  const todayKey = format(new Date(), "yyyy-MM-dd");

  const range = useMemo(() => {
    const [y, m, d] = todayKey.split("-").map(Number);
    const now = new Date(y, m - 1, d);

    if (preset === "custom" && customStart && customEnd) {
      return {
        start: startOfDay(new Date(customStart)),
        end: endOfDay(new Date(customEnd)),
      };
    }
    if (preset === "7d") {
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
    }
    if (preset === "month") {
      return { start: startOfMonth(now), end: endOfDay(now) };
    }
    if (preset === "30d") {
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
    }
    return {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    };
  }, [preset, customStart, customEnd, todayKey]);

  useEffect(() => {
    if (!isAdmin || !uid) return;
    let cancelled = false;
    (async () => {
      try {
        const db = getFirebaseDb();
        const u = await listUsers(db);
        if (!cancelled) setUsers(u);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, uid]);

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    const u1 = subscribeLeadsForUser(db, uid, isAdmin, setLeads);
    const u2 = subscribeTasksForUser(db, uid, isAdmin, setTasks);
    const u3 = subscribeDealsForUser(db, uid, isAdmin, setDeals);
    return () => {
      u1();
      u2();
      u3();
    };
  }, [uid, isAdmin]);

  const dealIds = useMemo(() => deals.map((d) => d.id), [deals]);
  const dealIdsKey = dealIds.join(",");

  useEffect(() => {
    if (!uid || !showCorporate) return;
    const db = getFirebaseDb();
    return subscribeProposals(
      db,
      { isAdmin, dealIds },
      setProposals
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, isAdmin, showCorporate, dealIdsKey]);

  useEffect(() => {
    if (!uid || !showEnrollmentsBlock) return;
    const db = getFirebaseDb();
    return subscribeRecentEnrollments(db, setEnrollments);
  }, [uid, showEnrollmentsBlock]);

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    return subscribeActivitiesInDateRange(
      db,
      range.start,
      range.end,
      setActivities
    );
  }, [uid, range.start, range.end]);

  const statsInRange = useMemo(() => {
    const start = range.start;
    const end = range.end;

    const leadsInRange: Lead[] = [];
    const enrolledInRange: Lead[] = [];
    const sourceCounts: Record<string, number> = {};
    LEAD_SOURCES.forEach((s) => {
      sourceCounts[s] = 0;
    });

    leads.forEach((l) => {
      if (inRange(l.createdAt, start, end)) {
        leadsInRange.push(l);
        sourceCounts[l.source] = (sourceCounts[l.source] ?? 0) + 1;
      }
      if (
        l.educationStage === "enrolled" &&
        inRange(l.updatedAt, start, end)
      ) {
        enrolledInRange.push(l);
      }
    });

    const enrollmentsInRange = enrollments.filter((e) =>
      inRange(e.createdAt, start, end)
    );

    const discussionActivities = activities.filter((a) =>
      ["phone_call", "whatsapp", "meeting"].includes(a.activityType)
    );

    const proposalsSentInRange = proposals.filter((p) => {
      if (p.status !== "sent" && p.status !== "accepted") return false;
      const t = p.sentAt ?? p.updatedAt;
      return inRange(t, start, end);
    });

    const dealsWonInRange: Deal[] = [];
    const bottleneckCounts = new Map<DealStage, number>();
    CORPORATE_DEAL_STAGES.forEach((s) => bottleneckCounts.set(s, 0));

    deals.forEach((d) => {
      if (d.stage === "won" && inRange(d.updatedAt, start, end)) {
        dealsWonInRange.push(d);
      }
      if (d.stage !== "won" && d.stage !== "lost") {
        bottleneckCounts.set(d.stage, (bottleneckCounts.get(d.stage) ?? 0) + 1);
      }
    });

    let bestStage: DealStage | null = null;
    let maxStageCount = 0;
    bottleneckCounts.forEach((n, s) => {
      if (n > maxStageCount) {
        maxStageCount = n;
        bestStage = s;
      }
    });

    const tasksDoneInRange: Task[] = [];
    const tasksOverdueOpen: Task[] = [];
    const [y, m, d] = todayKey.split("-").map(Number);
    const now = new Date(y, m - 1, d);

    tasks.forEach((t) => {
      if (t.status === "done" && inRange(t.completedAt, start, end)) {
        tasksDoneInRange.push(t);
      }
      if (t.status === "open" && t.dueDate && t.dueDate < now) {
        tasksOverdueOpen.push(t);
      }
    });

    const bySource = LEAD_SOURCES.map((s) => ({
      key: s,
      name: LABELS.source[s],
      count: sourceCounts[s] ?? 0,
    }));

    // Owner stats optimization: Pre-map users for O(1) lookup
    const userMap = new Map(users.map((u) => [u.id, u.name]));
    const ownerMap = new Map<string, { leadsNew: number; dealsWon: number }>();

    if (isAdmin) {
      leadsInRange.forEach((l) => {
        const o = l.ownerId;
        if (!ownerMap.has(o)) ownerMap.set(o, { leadsNew: 0, dealsWon: 0 });
        ownerMap.get(o)!.leadsNew += 1;
      });
      dealsWonInRange.forEach((d) => {
        const o = d.ownerId;
        if (!ownerMap.has(o)) ownerMap.set(o, { leadsNew: 0, dealsWon: 0 });
        ownerMap.get(o)!.dealsWon += 1;
      });
    }

    const ownerStats = [...ownerMap.entries()]
      .map(([id, v]) => ({ id, name: userMap.get(id) ?? id, ...v }))
      .sort((a, b) => b.leadsNew + b.dealsWon - (a.leadsNew + a.dealsWon));

    return {
      leadsInRange,
      enrolledInRange,
      enrollmentsInRange,
      discussionActivities,
      proposalsSentInRange,
      dealsWonInRange,
      pipelineBottleneck:
        bestStage && maxStageCount > 0
          ? { stage: bestStage, count: maxStageCount }
          : null,
      tasksDoneInRange,
      tasksOverdueOpen,
      bySource,
      ownerStats,
    };
  }, [
    leads,
    deals,
    tasks,
    proposals,
    enrollments,
    activities,
    range.start,
    range.end,
    users,
    isAdmin,
    todayKey,
  ]);

  const {
    leadsInRange,
    enrolledInRange,
    enrollmentsInRange,
    discussionActivities,
    proposalsSentInRange,
    dealsWonInRange,
    pipelineBottleneck,
    tasksDoneInRange,
    tasksOverdueOpen,
    bySource,
    ownerStats,
  } = statsInRange;

  const globalStats = useMemo(() => {
    const totalLeadsAll = leads.length;
    let enrolledAll = 0;

    const sourceMap = new Map<string, { total: number; enrolled: number }>();
    LEAD_SOURCES.forEach((s) => sourceMap.set(s, { total: 0, enrolled: 0 }));

    leads.forEach((l) => {
      const isEnrolled = l.educationStage === "enrolled";
      if (isEnrolled) enrolledAll++;

      const counts = sourceMap.get(l.source);
      if (counts) {
        counts.total++;
        if (isEnrolled) counts.enrolled++;
      }
    });

    const conversionBySource = LEAD_SOURCES.map((s) => {
      const { total, enrolled } = sourceMap.get(s)!;
      return {
        source: LABELS.source[s],
        total,
        enrolled,
        pct: total ? Math.round((enrolled / total) * 100) : 0,
      };
    })
      .filter((r) => r.total > 0)
      .sort((a, b) => b.pct - a.pct);

    const conversionAll = totalLeadsAll
      ? Math.round((enrolledAll / totalLeadsAll) * 100)
      : 0;

    return {
      totalLeadsAll,
      enrolledAll,
      conversionAll,
      conversionBySource,
    };
  }, [leads]);

  const { totalLeadsAll, enrolledAll, conversionAll, conversionBySource } =
    globalStats;

  const csvRowCount = useMemo(() => {
    return 12 + leadsInRange.length;
  }, [leadsInRange.length]);

  const exportCsv = useCallback(() => {
    const rows: string[][] = [
      ["Rapor", "GOS"],
      ["Aralık başı", range.start.toISOString()],
      ["Aralık sonu", range.end.toISOString()],
      [],
      ["Metrik", "Değer"],
      ["Yeni lead (aralık)", String(leadsInRange.length)],
      ["Görüşme/tel/WA aktivitesi", String(discussionActivities.length)],
      ["Yeni program kaydı (enrollment)", String(enrollmentsInRange.length)],
      ["Teklif (gönderildi/kabul)", String(proposalsSentInRange.length)],
      ["Kazanılan fırsat", String(dealsWonInRange.length)],
      ["Tamamlanan görev", String(tasksDoneInRange.length)],
      [],
      ["Lead id", "Ad", "Sahip id", "Kaynak", "Eğitim aşaması"],
      ...leadsInRange.map((l) => [
        l.id,
        l.name,
        l.ownerId,
        LABELS.source[l.source],
        LABELS.educationStage[l.educationStage],
      ]),
    ];
    downloadCsv(
      `gos-rapor-${range.start.toISOString().slice(0, 10)}.csv`,
      rows
    );
  }, [
    range.start,
    range.end,
    leadsInRange,
    discussionActivities,
    enrollmentsInRange,
    proposalsSentInRange,
    dealsWonInRange,
    tasksDoneInRange,
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raporlar"
        description="Tarih aralığına göre özet metrikler, kaynak dağılımı ve dışa aktarma."
        action={
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Dönem</Label>
            <Select
              value={preset}
              onValueChange={(v) => v && setPreset(v as Preset)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Bu hafta</SelectItem>
                <SelectItem value="7d">Son 7 gün</SelectItem>
                <SelectItem value="month">Bu ay</SelectItem>
                <SelectItem value="30d">Son 30 gün</SelectItem>
                <SelectItem value="custom">Özel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {preset === "custom" ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">Başlangıç</Label>
                <Input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Bitiş</Label>
                <Input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            </>
          ) : null}
          <Button type="button" size="sm" onClick={exportCsv}>
            <Download className="mr-1 size-4" />
            CSV indir ({csvRowCount} satır)
          </Button>
        </div>
        }
      />

      <p className="text-xs text-muted-foreground">
        Seçili aralık:{" "}
        {range.start.toLocaleDateString("tr-TR")} —{" "}
        {range.end.toLocaleDateString("tr-TR")}
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Yeni lead (dönem)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {leadsInRange.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Görüşme / tel / WA
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {discussionActivities.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Program kaydı (dönem)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {enrollmentsInRange.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eğitim: kayıt güncellemesi
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {enrolledInRange.length}
          </CardContent>
        </Card>
      </div>

      {showCorporate ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Teklif (gönderildi / kabul, dönem)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {proposalsSentInRange.length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Kazanılan fırsat (dönem)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {dealsWonInRange.length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pipeline tıkanıklığı (açık)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-lg font-semibold leading-snug">
              {pipelineBottleneck ? (
                <>
                  {LABELS.dealStage[pipelineBottleneck.stage]}
                  <span className="ml-2 text-2xl tabular-nums">
                    {pipelineBottleneck.count}
                  </span>
                </>
              ) : (
                "—"
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam lead (tümü)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{totalLeadsAll}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kayıt olan (eğitim, tümü)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{enrolledAll}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dönüşüm (genel)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">%{conversionAll}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tamamlanan görev (dönem)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {tasksDoneInRange.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Geciken açık görev
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-destructive">
            {tasksOverdueOpen.length}
          </CardContent>
        </Card>
      </div>

      {isAdmin && ownerStats.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personel özeti (dönem)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Personel</TableHead>
                  <TableHead className="text-right">Yeni lead</TableHead>
                  <TableHead className="text-right">Kazanılan iş</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ownerStats.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.leadsNew}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.dealsWon}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {isAdmin && conversionBySource.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Kanal dönüşümü (kayıt / lead, tüm zaman)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kaynak</TableHead>
                  <TableHead className="text-right">Lead</TableHead>
                  <TableHead className="text-right">Kayıt</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversionBySource.slice(0, 12).map((r) => (
                  <TableRow key={r.source}>
                    <TableCell>{r.source}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.total}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.enrolled}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      %{r.pct}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Lead kaynakları (dönem: yeni lead)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bySource} margin={{ left: 8, right: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={80}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
