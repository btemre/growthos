"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { CORPORATE_DEAL_STAGES, LABELS } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { subscribeDealsForUser, updateDealStage } from "@/lib/firestore/deals";
import type { Deal, DealStage } from "@/types/models";
import { cn } from "@/lib/utils";

function StageColumn({
  stage,
  children,
}: {
  stage: DealStage;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/20 transition-colors",
        isOver && "border-primary/50 bg-primary/5"
      )}
    >
      <div className="border-b px-3 py-2">
        <p className="text-sm font-semibold">{LABELS.dealStage[stage]}</p>
      </div>
      <ScrollArea className="max-h-[calc(100vh-220px)]">
        <div className="space-y-2 p-2">{children}</div>
      </ScrollArea>
    </div>
  );
}

function DealCard({
  deal,
  showProposalLink,
}: {
  deal: Deal;
  showProposalLink?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: deal.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card
        className={cn(
          "cursor-grab border-border/80 shadow-sm active:cursor-grabbing",
          isDragging && "opacity-60"
        )}
      >
        <CardContent className="space-y-2 p-3 text-sm">
          <p className="font-medium">{deal.title}</p>
          <p className="text-xs text-muted-foreground">{deal.companyName}</p>
          <Badge variant="secondary" className="text-[10px]">
            {LABELS.serviceType[deal.serviceType]}
          </Badge>
          {showProposalLink ? (
            <Link
              href={`/proposals?deal=${deal.id}`}
              className="inline-block text-xs font-medium text-primary hover:underline"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              Teklif →
            </Link>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function CorporateBoard() {
  const { firebaseUser, profile } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    return subscribeDealsForUser(db, uid, isAdmin, setDeals);
  }, [uid, isAdmin]);

  const byStage = useMemo(() => {
    const map = new Map<DealStage, Deal[]>();
    CORPORATE_DEAL_STAGES.forEach((s) => map.set(s, []));
    deals.forEach((d) => {
      const list = map.get(d.stage) ?? [];
      list.push(d);
      map.set(d.stage, list);
    });
    return map;
  }, [deals]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  async function onDragEnd(e: DragEndEvent) {
    const dealId = String(e.active.id);
    const overId = e.over?.id;
    if (!overId) return;
    let stage: DealStage | undefined;
    if (CORPORATE_DEAL_STAGES.includes(overId as DealStage)) {
      stage = overId as DealStage;
    } else {
      const target = deals.find((d) => d.id === overId);
      stage = target?.stage;
    }
    if (!stage) return;
    try {
      const db = getFirebaseDb();
      await updateDealStage(db, dealId, stage);
      toast.success("Deal aşaması güncellendi");
    } catch (err) {
      console.error(err);
      toast.error("Güncellenemedi");
    }
  }

  const canManage =
    profile?.role === "admin" || profile?.role === "business_dev";

  if (!canManage && deals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Kurumsal pipeline için iş geliştirme veya yönetici rolü gerekir. Size atanmış
        fırsat yoksa liste boş görünür.
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
              Kurumsal iş geliştirme pipeline
            </h2>
            <p className="text-sm text-muted-foreground">
              Fırsat kartlarını sürükleyerek aşama güncelleyin.
            </p>
          </div>
          {canManage ? (
            <Link
              href="/pipeline/corporate/new"
              className="text-sm font-medium text-primary hover:underline"
            >
              + Yeni fırsat
            </Link>
          ) : null}
        </div>
        <div className="w-full overflow-x-auto pb-2">
          <div className="flex min-w-min gap-3 pb-2">
            {CORPORATE_DEAL_STAGES.map((stage) => (
              <StageColumn key={stage} stage={stage}>
                {(byStage.get(stage) ?? []).map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    showProposalLink={canManage}
                  />
                ))}
              </StageColumn>
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
