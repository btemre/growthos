"use client";

import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Enrollment } from "@/types/models";

export function LeadEnrollmentTab({
  enrollments,
  programTitleById,
}: {
  enrollments: Enrollment[];
  programTitleById: Map<string, string>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Program kayıtları</CardTitle>
        <Link href="/programs" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Programlar
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Bu lead&apos;in kayıtlı olduğu programlar ve ödeme durumu.
        </p>
        <div className="space-y-2">
          {enrollments.map((en) => (
            <div
              key={en.id}
              className="flex flex-col gap-2 rounded-lg border bg-card/50 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {programTitleById.get(en.programId) ?? "Program"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {en.joinedAt
                    ? `Kayıt: ${format(en.joinedAt, "d MMM yyyy", { locale: tr })}`
                    : "Kayıt tarihi yok"}
                  {en.paymentAmount != null
                    ? ` · ${en.paymentAmount.toLocaleString("tr-TR")} ₺`
                    : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{LABELS.paymentStatus[en.paymentStatus]}</Badge>
                <Link
                  href={`/programs/${en.programId}`}
                  className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                >
                  Programa git
                </Link>
              </div>
            </div>
          ))}
        </div>
        {enrollments.length === 0 ? (
          <p className="text-muted-foreground">Henüz bir programa kayıt yok.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
