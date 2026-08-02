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
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge, leadScoreTone } from "@/components/shared/status-badge";
import { useAuth } from "@/contexts/auth-context";
import { useUserDirectory } from "@/hooks/use-user-directory";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EDUCATION_STAGES, LABELS } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { subscribeLeadsForUser, updateLead } from "@/lib/firestore/leads";
import type { EducationStage, Lead } from "@/types/models";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CRITICAL_STAGES: EducationStage[] = ["enrolled", "dropped", "not_suitable"];

function StageColumn({
  stage,
  count,
  children,
}: {
  stage: EducationStage;
  count: number;
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
      <div className="flex items-center justify-between border-b px-3 py-2">
        <p className="text-sm font-semibold">{LABELS.educationStage[stage]}</p>
        <Badge variant="secondary" className="text-xs">
          {count}
        </Badge>
      </div>
      <ScrollArea className="max-h-[calc(100vh-220px)]">
        <div className="space-y-2 p-2">{children}</div>
      </ScrollArea>
    </div>
  );
}

// Wrap LeadCard in React.memo to prevent unnecessary cascade re-renders of unchanged cards in the pipeline
const LeadCard = memo(function LeadCard({ lead, ownerLabel }: { lead: Lead; ownerLabel: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: lead.id });

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
            href={`/leads/${lead.id}`}
            className="font-medium hover:underline"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {lead.name}
          </Link>
          <div className="flex flex-wrap items-center gap-1">
            <StatusBadge tone={leadScoreTone(lead.score)} className="text-[10px]">
              {lead.score}
            </StatusBadge>
            {lead.lastContactAt ? (
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(lead.lastContactAt, {
                  addSuffix: true,
                  locale: tr,
                })}
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">Temas yok</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Avatar className="size-5">
              <AvatarFallback className="text-[9px]">
                {ownerLabel.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {ownerLabel}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export function EducationBoard() {
  const { firebaseUser, profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pending, setPending] = useState<{
    leadId: string;
    stage: EducationStage;
  } | null>(null);
  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";
  const { resolveOwner } = useUserDirectory(isAdmin);

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    return subscribeLeadsForUser(db, uid, isAdmin, setLeads);
  }, [uid, isAdmin]);

  const byStage = useMemo(() => {
    const map = new Map<EducationStage, Lead[]>();
    EDUCATION_STAGES.forEach((s) => map.set(s, []));
    leads
      .filter((l) => l.type === "education_candidate")
      .forEach((l) => {
        const list = map.get(l.educationStage) ?? [];
        list.push(l);
        map.set(l.educationStage, list);
      });
    return map;
  }, [leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  async function applyStage(leadId: string, stage: EducationStage) {
    try {
      const db = getFirebaseDb();
      await updateLead(db, leadId, { educationStage: stage });
      toast.success("Aşama güncellendi");
    } catch (err) {
      console.error(err);
      toast.error("Güncellenemedi");
    }
  }

  async function onDragEnd(e: DragEndEvent) {
    const leadId = String(e.active.id);
    const overId = e.over?.id;
    if (!overId) return;
    let stage: EducationStage | undefined;
    if (EDUCATION_STAGES.includes(overId as EducationStage)) {
      stage = overId as EducationStage;
    } else {
      const target = leads.find((l) => l.id === overId);
      stage = target?.educationStage;
    }
    if (!stage) return;
    if (CRITICAL_STAGES.includes(stage)) {
      setPending({ leadId, stage });
      return;
    }
    await applyStage(leadId, stage);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="space-y-4">
        <PageHeader
          title="Eğitim satış pipeline"
          description='Kartları sürükleyerek aşama değiştirin. "Kayıt Oldu" ve "Vazgeçti" onay gerektirir.'
        />
        <div className="w-full overflow-x-auto pb-2">
          <div className="flex min-w-min gap-3 pb-2">
            {EDUCATION_STAGES.map((stage) => (
              <StageColumn
                key={stage}
                stage={stage}
                count={(byStage.get(stage) ?? []).length}
              >
                {(byStage.get(stage) ?? []).map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    ownerLabel={resolveOwner(lead.ownerId, uid)}
                  />
                ))}
              </StageColumn>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title="Aşama değişikliğini onayla"
        description={
          pending
            ? `Lead bu aşamaya taşınacak: ${LABELS.educationStage[pending.stage]}`
            : undefined
        }
        confirmLabel="Onayla"
        onConfirm={async () => {
          if (!pending) return;
          await applyStage(pending.leadId, pending.stage);
          setPending(null);
        }}
      />
    </DndContext>
  );
}
