"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ClipboardList, UserSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GlobalRightRail } from "./global-right-rail";

function LeadRouteHint({ leadId }: { leadId: string }) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Bu lead</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        <p>Hızlı görev ve not için aşağıdaki panelde bu lead&apos;i seçin.</p>
        <Link
          href={`/leads/${leadId}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Lead detayına git"
        >
          Lead detayına git
        </Link>
      </CardContent>
    </Card>
  );
}

export function RouteRightRail() {
  const pathname = usePathname();

  const leadMatch = pathname.match(/^\/leads\/([^/]+)$/);
  const leadId = leadMatch?.[1];

  return (
    <div className="space-y-4">
      {pathname === "/dashboard" ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Dashboard ipucu</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            KPI kartlarına tıklayarak ilgili listeye gidebilirsiniz.
          </CardContent>
        </Card>
      ) : null}

      {pathname === "/leads" ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <UserSearch className="size-4" aria-hidden="true" />
              Lead listesi
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Sıcak ve bugün eklenen filtrelerini kullanarak önceliklendirin.
          </CardContent>
        </Card>
      ) : null}

      {pathname === "/tasks" ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ClipboardList className="size-4" aria-hidden="true" />
              Görevler
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Geciken görevler üstte gruplanır. URL:{" "}
            <code className="rounded bg-muted px-1">?filter=overdue</code>
          </CardContent>
        </Card>
      ) : null}

      {leadId && leadId !== "new" ? <LeadRouteHint leadId={leadId} /> : null}

      <GlobalRightRail />
    </div>
  );
}
