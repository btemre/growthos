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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { EDUCATION_STAGES, LABELS } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { subscribeLeadsForUser, updateLead } from "@/lib/firestore/leads";
import type { EducationStage, Lead } from "@/types/models";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function StageColumn({
  stage,
  children,
}: {
  stage: EducationStage;
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
        <p className="text-sm font-semibold">{LABELS.educationStage[stage]}</p>
      </div>
      <ScrollArea className="max-h-[calc(100vh-220px)]">
        <div className="space-y-2 p-2">{children}</div>
      </ScrollArea>
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
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
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-[10px]">
              {LABELS.source[lead.source]}
            </Badge>
            {lead.score >= 60 ? (
              <Badge
                variant="outline"
                className="border-[color:var(--semantic-hot)]/50 text-[10px] text-[color:var(--semantic-hot)]"
              >
                sıcak
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EducationBoard() {
  const { firebaseUser, profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";

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
    try {
      const db = getFirebaseDb();
      await updateLead(db, leadId, { educationStage: stage });
      toast.success("Aşama güncellendi");
    } catch (err) {
      console.error(err);
      toast.error("Güncellenemedi");
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="space-y-4">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
            Eğitim satış pipeline
          </h2>
          <p className="text-sm text-muted-foreground">
            Kartları sürükleyerek aşama değiştirin. Sadece &quot;Eğitim adayı&quot; lead
            türü listelenir.
          </p>
        </div>
        <div className="w-full overflow-x-auto pb-2">
          <div className="flex min-w-min gap-3 pb-2">
            {EDUCATION_STAGES.map((stage) => (
              <StageColumn key={stage} stage={stage}>
                {(byStage.get(stage) ?? []).map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </StageColumn>
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
