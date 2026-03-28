import { Suspense } from "react";
import { ProposalsPageClient } from "@/components/proposals/proposals-page-client";

export default function ProposalsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Yükleniyor…</div>}>
      <ProposalsPageClient />
    </Suspense>
  );
}
