"use client";

import Link from "next/link";
import { ClipboardList, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function DashboardRightRail() {
  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" />
            Hızlı hatırlatma
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Sıcak lead’leri ve geciken görevleri Dashboard’daki uyarılar bölümünden takip edin.
          Detay için lead veya görev sayfasına gidin.
        </CardContent>
      </Card>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Kısayol
        </p>
        <Link
          href="/tasks"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full justify-start"
          )}
        >
          <ClipboardList className="mr-2 size-4" />
          Görev listesi
        </Link>
      </div>

      <Separator />

      <div className="text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Son aktiviteler</p>
        <p className="mt-1">
          Aktivite akışı her lead veya fırsat detayında görüntülenir. Genel akış için V2
          planlanmıştır.
        </p>
      </div>
    </div>
  );
}
