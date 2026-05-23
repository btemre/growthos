"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/contexts/auth-context";
import { LABELS } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { subscribeLeadsForUser } from "@/lib/firestore/leads";
import { subscribeTasksForUser } from "@/lib/firestore/tasks";
import { subscribeDealsForUser } from "@/lib/firestore/deals";
import { listUsers } from "@/lib/firestore/users";
import type { AppUser, Deal, Lead, Task } from "@/types/models";

export function TeamPageClient() {
  const { firebaseUser, profile } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";

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

  const byOwner = useMemo(() => {
    const map = new Map<
      string,
      { leads: number; openTasks: number; deals: number; pipeline: number }
    >();
    const touch = (id: string) => {
      if (!map.has(id))
        map.set(id, { leads: 0, openTasks: 0, deals: 0, pipeline: 0 });
      return map.get(id)!;
    };
    leads.forEach((l) => {
      touch(l.ownerId).leads += 1;
    });
    tasks.forEach((t) => {
      if (t.status === "open") touch(t.assignedTo).openTasks += 1;
    });
    deals.forEach((d) => {
      const row = touch(d.ownerId);
      row.deals += 1;
      row.pipeline += d.estimatedValue ?? 0;
    });
    return map;
  }, [leads, tasks, deals]);

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personel özeti</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Ekip geneli metrikleri yalnızca yönetici rolüyle görüntülenebilir. Kendi
          lead ve görevleriniz Dashboard ve ilgili sayfalarda yer alır.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personel performans özeti"
        description="Lead sahipliği, açık görev ve kurumsal pipeline katkısı."
      />
      {users.length === 0 ? (
        <EmptyState
          title="Kullanıcı bulunamadı"
          description="Giriş yapan kullanıcılar Firestore'da profil olarak oluşturulur."
        />
      ) : (
      <div className="grid gap-4 md:grid-cols-2">
        {users.map((u) => {
          const s = byOwner.get(u.id) ?? {
            leads: 0,
            openTasks: 0,
            deals: 0,
            pipeline: 0,
          };
          return (
            <Card key={u.id} className="border-border/80">
              <CardHeader>
                <CardTitle className="text-lg">{u.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {u.email} · {LABELS.role[u.role]}
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Lead (sahiplik)</p>
                  <p className="text-xl font-semibold">{s.leads}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Açık görev</p>
                  <p className="text-xl font-semibold">{s.openTasks}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kurumsal fırsat</p>
                  <p className="text-xl font-semibold">{s.deals}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pipeline ₺</p>
                  <p className="text-xl font-semibold">
                    {s.pipeline.toLocaleString("tr-TR")}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}
    </div>
  );
}
