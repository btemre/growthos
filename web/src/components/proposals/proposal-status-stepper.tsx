"use client";

import { LABELS } from "@/lib/constants";
import type { ProposalStatus } from "@/types/models";
import { cn } from "@/lib/utils";

const FLOW: ProposalStatus[] = [
  "draft",
  "prepared",
  "sent",
  "revision_requested",
  "accepted",
  "rejected",
];

export function ProposalStatusStepper({ status }: { status: ProposalStatus }) {
  const currentIdx = FLOW.indexOf(status);

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs" aria-label="Teklif durumu">
      {FLOW.map((s, i) => {
        const active = s === status;
        const done = currentIdx > i;
        const isRejected = status === "rejected" && s === "rejected";
        return (
          <div key={s} className="flex items-center gap-1">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-medium",
                active && "bg-primary text-primary-foreground",
                done && !active && "bg-muted text-muted-foreground",
                !active && !done && "border border-dashed text-muted-foreground",
                isRejected && active && "bg-destructive text-destructive-foreground"
              )}
            >
              {LABELS.proposalStatus[s]}
            </span>
            {i < FLOW.length - 1 ? (
              <span className="text-muted-foreground" aria-hidden>
                →
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
