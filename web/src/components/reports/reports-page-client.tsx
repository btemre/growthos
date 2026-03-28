"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { LABELS, LEAD_SOURCES } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { subscribeLeadsForUser } from "@/lib/firestore/leads";
import type { Lead } from "@/types/models";

export function ReportsPageClient() {
  const { firebaseUser, profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    return subscribeLeadsForUser(db, uid, isAdmin, setLeads);
  }, [uid, isAdmin]);

  const bySource = useMemo(() => {
    const counts: Record<string, number> = {};
    LEAD_SOURCES.forEach((s) => {
      counts[s] = 0;
    });
    leads.forEach((l) => {
      counts[l.source] = (counts[l.source] ?? 0) + 1;
    });
    return LEAD_SOURCES.map((s) => ({
      key: s,
      name: LABELS.source[s],
      count: counts[s] ?? 0,
    }));
  }, [leads]);

  const enrolled = leads.filter((l) => l.educationStage === "enrolled").length;
  const total = leads.length;
  const conversion = total ? Math.round((enrolled / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
          Raporlar
        </h2>
        <p className="text-sm text-muted-foreground">
          Kaynak dağılımı ve eğitim dönüşüm özeti (MVP).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam lead
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{total}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kayıt olan (eğitim)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{enrolled}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dönüşüm (kayıt / lead)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">%{conversion}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lead kaynakları</CardTitle>
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
