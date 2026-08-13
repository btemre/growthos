"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ProposalStatusStepper } from "./proposal-status-stepper";
import { useAuth } from "@/contexts/auth-context";
import { LABELS, PROPOSAL_STATUSES } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { subscribeDealsForUser } from "@/lib/firestore/deals";
import {
  createProposal,
  subscribeProposals,
  updateProposal,
} from "@/lib/firestore/proposals";
import type { Deal, Proposal, ProposalStatus } from "@/types/models";

function canUseProposals(role: string | undefined) {
  return role === "admin" || role === "business_dev";
}

export function ProposalsPageClient() {
  const { firebaseUser, profile } = useAuth();
  const searchParams = useSearchParams();
  const preDealId = searchParams.get("deal") ?? "";

  const [deals, setDeals] = useState<Deal[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Proposal | null>(null);
  const [dealId, setDealId] = useState("");
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<ProposalStatus>("draft");
  const [validUntil, setValidUntil] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [optionalModules, setOptionalModules] = useState("");
  const [busy, setBusy] = useState(false);

  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";
  const allowed = canUseProposals(profile?.role);

  useEffect(() => {
    if (!uid || !allowed) return;
    const db = getFirebaseDb();
    return subscribeDealsForUser(db, uid, isAdmin, setDeals);
  }, [uid, isAdmin, allowed]);

  // Optimize: Combine dealIds map and key generation to avoid joins on every render
  const { dealIds, dealIdsKey } = useMemo(() => {
    const ids = deals.map((d) => d.id);
    return { dealIds: ids, dealIdsKey: ids.join(",") };
  }, [deals]);

  // Optimize: Use stable dealIdsKey for effect dependency to prevent redundant subscriptions
  useEffect(() => {
    if (!uid || !allowed) return;
    const db = getFirebaseDb();
    return subscribeProposals(
      db,
      { isAdmin, dealIds },
      setProposals
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, isAdmin, allowed, dealIdsKey]);

  const dealById = useMemo(() => {
    const m = new Map<string, Deal>();
    for (const d of deals) m.set(d.id, d);
    return m;
  }, [deals]);

  // Optimize: Avoid calling setState inside useEffect by adjusting state in render phase
  const [prevPreDealId, setPrevPreDealId] = useState(preDealId);
  const [prevDealIdsKey, setPrevDealIdsKey] = useState(dealIdsKey);

  if (preDealId !== prevPreDealId || dealIdsKey !== prevDealIdsKey) {
    setPrevPreDealId(preDealId);
    setPrevDealIdsKey(dealIdsKey);
    if (preDealId && deals.some((d) => d.id === preDealId)) {
      setDealId(preDealId);
    }
  }

  function openCreate() {
    setEditing(null);
    setTitle("");
    setScope("");
    setPrice("");
    setStatus("draft");
    setValidUntil("");
    setCustomerName("");
    setDeliveryNote("");
    setOptionalModules("");
    setDealId(
      preDealId && deals.some((d) => d.id === preDealId)
        ? preDealId
        : deals[0]?.id ?? ""
    );
    setDialogOpen(true);
  }

  function openEdit(p: Proposal) {
    setEditing(p);
    setDealId(p.dealId);
    setTitle(p.title);
    setScope(p.scope);
    setPrice(p.price != null ? String(p.price) : "");
    setStatus(p.status);
    setValidUntil(
      p.validUntil ? format(p.validUntil, "yyyy-MM-dd") : ""
    );
    setCustomerName(p.customerName ?? "");
    setDeliveryNote(p.deliveryNote ?? "");
    setOptionalModules(p.optionalModules ?? "");
    setDialogOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid || !allowed) return;
    if (!dealId) {
      toast.error("Fırsat (deal) seçin");
      return;
    }
    setBusy(true);
    try {
      const db = getFirebaseDb();
      const priceNum = price.trim() ? Number(price) : undefined;
      const valid = validUntil.trim()
        ? new Date(validUntil)
        : null;
      if (editing) {
        const prevStatus = editing.status;
        await updateProposal(
          db,
          editing.id,
          {
            title: title.trim(),
            scope: scope.trim(),
            price: Number.isFinite(priceNum as number) ? priceNum : undefined,
            status,
            validUntil: valid,
            customerName: customerName.trim() || undefined,
            deliveryNote: deliveryNote.trim() || undefined,
            optionalModules: optionalModules.trim() || undefined,
          },
          {
            setSentAtIfStatusSent:
              status === "sent" && prevStatus !== "sent",
          }
        );
        toast.success("Teklif güncellendi");
      } else {
        await createProposal(db, {
          dealId,
          title: title.trim(),
          scope: scope.trim(),
          price: Number.isFinite(priceNum as number) ? priceNum : undefined,
          status,
          validUntil: valid,
          customerName: customerName.trim() || undefined,
          deliveryNote: deliveryNote.trim() || undefined,
          optionalModules: optionalModules.trim() || undefined,
          createdBy: uid,
        });
        toast.success("Teklif oluşturuldu");
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Kaydedilemedi");
    } finally {
      setBusy(false);
    }
  }

  if (!allowed) {
    return (
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
          Teklifler
        </h1>
        <p className="text-sm text-muted-foreground">
          Bu modüle yalnızca yönetici ve iş geliştirme rolü erişebilir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teklifler"
        description="Kurumsal fırsatlara bağlı teklifler; durum ve geçerlilik takibi."
        action={
          <Button
            type="button"
            onClick={openCreate}
            disabled={deals.length === 0}
          >
            Yeni teklif
          </Button>
        }
      />

      {deals.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Teklif oluşturmak için önce kurumsal pipeline&apos;da size atanmış
          bir fırsat olmalı.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liste</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Fırsat</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Geçerlilik</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((p) => {
                const deal = dealById.get(p.dealId);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {deal
                        ? `${deal.title} · ${deal.companyName}`
                        : p.dealId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {LABELS.proposalStatus[p.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.validUntil
                        ? format(p.validUntil, "d MMM yyyy", { locale: tr })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {p.price != null
                        ? `${p.price.toLocaleString("tr-TR")} ₺`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(p)}
                      >
                        Düzenle
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {proposals.length === 0 ? (
            <div className="p-6">
              <EmptyState title="Teklif yok" description="Yeni teklif oluşturun veya fırsat ekleyin." />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Teklifi düzenle" : "Yeni teklif"}
              </DialogTitle>
            </DialogHeader>
            {editing ? (
              <div className="px-1 pb-2">
                <ProposalStatusStepper status={status} />
              </div>
            ) : null}
            <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4 pr-1">
              <div className="space-y-2">
                <Label>Fırsat (deal)</Label>
                <Select
                  value={dealId}
                  onValueChange={(v) => {
                    if (v) setDealId(v);
                  }}
                  disabled={!!editing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {deals.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.title} — {d.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Teklif başlığı</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Müşteri adı (isteğe bağlı)</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Kapsam</Label>
                <Textarea
                  rows={4}
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Teslim / süre notu</Label>
                <Input
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Opsiyonel modüller</Label>
                <Textarea
                  rows={2}
                  value={optionalModules}
                  onChange={(e) => setOptionalModules(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tutar (₺)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Geçerlilik</Label>
                  <Input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Durum</Label>
                <Select
                  value={status}
                  onValueChange={(v) => v && setStatus(v as ProposalStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPOSAL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {LABELS.proposalStatus[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={busy}>
                {busy ? "Kaydediliyor…" : "Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
