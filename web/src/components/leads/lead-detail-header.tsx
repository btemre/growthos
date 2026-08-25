"use client";

import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Phone } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, leadScoreTone } from "@/components/shared/status-badge";
import { LABELS } from "@/lib/constants";
import type { Lead } from "@/types/models";
import { LeadTags } from "./lead-tags";

export function LeadDetailHeader({
  lead,
  ownerLabel,
}: {
  lead: Lead;
  ownerLabel?: string;
}) {
  return (
    <div className="sticky top-0 z-10 -mx-4 border-b bg-background/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate font-[family-name:var(--font-heading)] text-2xl font-semibold">
            {lead.name}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{LABELS.leadType[lead.type]}</Badge>
            <Badge variant="outline">{LABELS.source[lead.source]}</Badge>
            <StatusBadge tone={leadScoreTone(lead.score)}>
              Skor {lead.score}
            </StatusBadge>
            {lead.type === "education_candidate" ? (
              <Badge variant="outline">
                {LABELS.educationStage[lead.educationStage]}
              </Badge>
            ) : null}
            <LeadTags tagIds={lead.tagIds} />
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 text-sm">
          {lead.phone ? (
            <a
              href={`tel:${lead.phone}`}
              aria-label={`${lead.name} kişisini ara: ${lead.phone}`}
              className="inline-flex h-8 items-center rounded-md border px-3 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Phone className="mr-1 size-3.5" aria-hidden="true" />
              Ara
            </a>
          ) : null}
          <Link
            href="/tasks"
            aria-label={`${lead.name} için görev ekle`}
            className="inline-flex h-8 items-center rounded-md border px-3 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Görev ekle
          </Link>
        </div>
      </div>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Son temas</dt>
          <dd className="font-medium">
            {lead.lastContactAt
              ? formatDistanceToNow(lead.lastContactAt, {
                  addSuffix: true,
                  locale: tr,
                })
              : "Henüz yok"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Sıradaki aksiyon</dt>
          <dd className="font-medium">
            {lead.nextActionAt
              ? format(lead.nextActionAt, "d MMM yyyy HH:mm", { locale: tr })
              : "Planlanmadı"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Owner</dt>
          <dd className="font-medium truncate">{ownerLabel ?? `${lead.ownerId.slice(0, 8)}…`}</dd>
        </div>
      </dl>
    </div>
  );
}
