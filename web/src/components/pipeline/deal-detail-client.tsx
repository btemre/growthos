"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { CheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useUserDirectory } from "@/hooks/use-user-directory";
import { LABELS } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { subscribeDeal } from "@/lib/firestore/deals";
import { getCompany } from "@/lib/firestore/companies";
import type { Company, Deal } from "@/types/models";
import { cn } from "@/lib/utils";

export function DealDetailClient({ dealId }: { dealId: string }) {
  const { firebaseUser, profile } = useAuth();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";
  const { resolveOwner } = useUserDirectory(isAdmin);

  useEffect(() => {
    const db = getFirebaseDb();
    return subscribeDeal(
      db,
      dealId,
      (d) => {
        setDeal(d);
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [dealId]);

  useEffect(() => {
    if (!deal?.companyId) return;
    const db = getFirebaseDb();
    getCompany(db, deal.companyId)
      .then(setCompany)
      .catch(console.error);
  }, [deal?.companyId]);

  const canManage =
    profile?.role === "admin" || profile?.role === "business_dev";

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!deal) {
    return (
      <p className="text-sm text-muted-foreground">
        Fırsat bulunamadı veya erişim yok.
      </p>
    );
  }

  const ownerLabel = resolveOwner(deal.ownerId, uid);

  const handleCopyId = () => {
    void navigator.clipboard.writeText(deal.id);
    setCopied(true);
    toast.success("Deal ID kopyalandı");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={deal.title}
        description={deal.companyName}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/pipeline/corporate"
              aria-label="Kurumsal pipeline sayfasına dön"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              Pipeline
            </Link>
            {canManage ? (
              <Link
                href={`/proposals?deal=${deal.id}`}
                aria-label={`${deal.title} için teklifleri görüntüle`}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
              >
                Teklifler
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{LABELS.dealStage[deal.stage]}</Badge>
        <Badge variant="outline">{LABELS.serviceType[deal.serviceType]}</Badge>
        {deal.probability != null ? (
          <StatusBadge tone="active">%{deal.probability} olasılık</StatusBadge>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fırsat özeti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Tahmini değer: </span>
              {deal.estimatedValue != null
                ? `${deal.estimatedValue.toLocaleString("tr-TR")} ₺`
                : "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Owner: </span>
              {ownerLabel}
            </p>
            <p>
              <span className="text-muted-foreground">Son güncelleme: </span>
              {deal.updatedAt
                ? formatDistanceToNow(deal.updatedAt, { addSuffix: true, locale: tr })
                : "—"}
            </p>
            {deal.expectedCloseDate ? (
              <p>
                <span className="text-muted-foreground">Beklenen kapanış: </span>
                {format(deal.expectedCloseDate, "d MMMM yyyy", { locale: tr })}
              </p>
            ) : null}
            {deal.notes ? (
              <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3">
                {deal.notes}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Firma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {company ? (
              <>
                <p className="font-medium">{company.name}</p>
                {company.sector ? (
                  <p className="text-muted-foreground">Sektör: {company.sector}</p>
                ) : null}
                {company.city ? (
                  <p className="text-muted-foreground">Şehir: {company.city}</p>
                ) : null}
                {company.website ? (
                  <a
                    href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${company.name} web sitesini yeni sekmede aç: ${company.website}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                  >
                    {company.website}
                    <ExternalLinkIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  </a>
                ) : null}
                {company.notes ? (
                  <p className="text-muted-foreground">{company.notes}</p>
                ) : null}
              </>
            ) : (
              <p className="text-muted-foreground">{deal.companyName}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Kişi (contacts) modülü V2 ile eklenecek.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hızlı aksiyonlar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyId}
            aria-label={copied ? "Deal ID kopyalandı" : "Deal ID kopyala"}
            className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {copied ? (
              <CheckIcon className="mr-1.5 size-3.5 text-green-600" aria-hidden="true" />
            ) : (
              <CopyIcon className="mr-1.5 size-3.5" aria-hidden="true" />
            )}
            {copied ? "Kopyalandı" : "ID kopyala"}
          </Button>
          <Link
            href="/tasks"
            aria-label={`${deal.title} fırsatı için yeni görev oluştur`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            Görev oluştur
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
