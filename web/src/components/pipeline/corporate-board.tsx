"use client";

import { useEffect, useMemo, useState, memo } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { CORPORATE_DEAL_STAGES, LABELS } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useUserDirectory } from "@/hooks/use-user-directory";
import { subscribeDealsForUser, updateDealStage } from "@/lib/firestore/deals";
import type { Deal, DealStage } from "@/types/models";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "@/lib/utils";

const CRITICAL_DEAL_STAGES: DealStage[] = ["won", "lost"];

function StageColumn({
  stage,
  count,
  totalValue,
  children,
}: {
  stage: DealStage;
  count: number;
  totalValue: number;
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
        <p className="text-xs text-muted-foreground">
          {count} fırsat
          {totalValue > 0
            ? ` · ${totalValue.toLocaleString("tr-TR")} ₺`
            : ""}
        </p>
      </div>
      <ScrollArea className="max-h-[calc(100vh-220px)]">
        <div className="space-y-2 p-2">{children}</div>
      </ScrollArea>
    </div>
  );
}

// Memoize DealCard to prevent unnecessary cascade re-renders of list items during drag-and-drop or snapshot updates.
const DealCard = memo(
  function DealCard({
    deal,
    ownerLabel,
    showProposalLink,
  }: {
    deal: Deal;
    ownerLabel: string;
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
            <Link
              href={`/pipeline/corporate/${deal.id}`}
              className="font-medium hover:underline"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {deal.title}
            </Link>
            <p className="text-xs text-muted-foreground">{deal.companyName}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Avatar className="size-5">
                <AvatarFallback className="text-[9px]">
                  {ownerLabel.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {ownerLabel}
            </div>
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
  },
  (prev, next) => {
    return (
      prev.ownerLabel === next.ownerLabel &&
      prev.showProposalLink === next.showProposalLink &&
      prev.deal.id === next.deal.id &&
      prev.deal.title === next.deal.title &&
      prev.deal.companyName === next.deal.companyName &&
      prev.deal.stage === next.deal.stage &&
      prev.deal.serviceType === next.deal.serviceType
    );
  }
);

export function CorporateBoard() {
  const { firebaseUser, profile } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pending, setPending] = useState<{ dealId: string; stage: DealStage } | null>(
    null
  );
  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";
  const { resolveOwner } = useUserDirectory(isAdmin);

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

  async function applyStage(dealId: string, stage: DealStage) {
    try {
      const db = getFirebaseDb();
      await updateDealStage(db, dealId, stage);
      toast.success("Deal aşaması güncellendi");
    } catch (err) {
      console.error(err);
      toast.error("Güncellenemedi");
    }
  }

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
    if (CRITICAL_DEAL_STAGES.includes(stage)) {
      setPending({ dealId, stage });
      return;
    }
    await applyStage(dealId, stage);
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
        <PageHeader
          title="Kurumsal iş geliştirme pipeline"
          description="Fırsat kartlarını sürükleyerek aşama güncelleyin."
          action={
            canManage ? (
              <Link
                href="/pipeline/corporate/new"
                className="text-sm font-medium text-primary hover:underline"
              >
                + Yeni fırsat
              </Link>
            ) : undefined
          }
        />
        <div className="w-full overflow-x-auto pb-2">
          <div className="flex min-w-min gap-3 pb-2">
            {CORPORATE_DEAL_STAGES.map((stage) => {
              const list = byStage.get(stage) ?? [];
              const totalValue = list.reduce(
                (acc, d) => acc + (d.estimatedValue ?? 0),
                0
              );
              return (
              <StageColumn
                key={stage}
                stage={stage}
                count={list.length}
                totalValue={totalValue}
              >
                {list.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    ownerLabel={resolveOwner(deal.ownerId, uid)}
                    showProposalLink={canManage}
                  />
                ))}
              </StageColumn>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title="Deal sonucunu onayla"
        description={
          pending
            ? `Fırsat şu aşamaya taşınacak: ${LABELS.dealStage[pending.stage]}`
            : undefined
        }
        onConfirm={async () => {
          if (!pending) return;
          await applyStage(pending.dealId, pending.stage);
          setPending(null);
        }}
      />
    </DndContext>
  );
}
