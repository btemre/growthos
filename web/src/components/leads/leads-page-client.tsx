"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, MessageCircle, Phone } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { StatusBadge, leadScoreTone } from "@/components/shared/status-badge";
import { useAuth } from "@/contexts/auth-context";
import { LABELS, LEAD_SOURCES, LEAD_TYPES } from "@/lib/constants";
import { getFirebaseDb } from "@/lib/firebase/client";
import { subscribeLeadsForUser } from "@/lib/firestore/leads";
import type { Lead } from "@/types/models";
import { LeadFormDialog } from "./lead-form-dialog";

type Preset = "all" | "hot" | "today" | "mine";

type TagOption = { id: string; name: string };

export function LeadsPageClient() {
  const { firebaseUser, profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [preset, setPreset] = useState<Preset>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [tags, setTags] = useState<TagOption[]>([]);

  const uid = firebaseUser?.uid ?? "";
  const isAdmin = profile?.role === "admin";

  const todayKey = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    return subscribeLeadsForUser(db, uid, isAdmin, setLeads);
  }, [uid, isAdmin]);

  useEffect(() => {
    const db = getFirebaseDb();
    return onSnapshot(collection(db, "tags"), (snap) => {
      setTags(
        snap.docs.map((d) => ({
          id: d.id,
          name: String(d.data().name ?? d.id),
        }))
      );
    });
  }, []);

  const filtered = useMemo(() => {
    const todayStart = startOfDay(new Date());

    return leads.filter((l) => {
      if (typeFilter !== "all" && l.type !== typeFilter) return false;
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (preset === "hot" && l.score < 50) return false;
      if (preset === "today") {
        const c = l.createdAt;
        if (!c || isBefore(c, todayStart)) return false;
      }
      if (preset === "mine" && l.ownerId !== uid) return false;
      if (tagFilter !== "all" && !l.tagIds?.includes(tagFilter)) return false;
      return true;
    });
  }, [leads, typeFilter, sourceFilter, preset, tagFilter, todayKey, uid]);

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            İsim
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <Link
            href={`/leads/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "type",
        header: "Tür",
        cell: ({ row }) => (
          <Badge variant="secondary">{LABELS.leadType[row.original.type]}</Badge>
        ),
      },
      {
        accessorKey: "source",
        header: "Kaynak",
        cell: ({ row }) => LABELS.source[row.original.source],
      },
      {
        accessorKey: "score",
        header: "Skor",
        cell: ({ row }) => (
          <StatusBadge tone={leadScoreTone(row.original.score)}>
            {row.original.score}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "lastContactAt",
        header: "Son temas",
        cell: ({ row }) =>
          row.original.lastContactAt
            ? format(row.original.lastContactAt, "d MMM yyyy", { locale: tr })
            : "—",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const l = row.original;
          return (
            <div className="flex justify-end gap-1">
              {l.phone ? (
                <a
                  href={`tel:${l.phone}`}
                  aria-label="Ara"
                  className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted"
                >
                  <Phone className="size-4" />
                </a>
              ) : null}
              {l.whatsapp || l.phone ? (
                <a
                  href={`https://wa.me/${(l.whatsapp ?? l.phone ?? "").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted"
                >
                  <MessageCircle className="size-4" />
                </a>
              ) : null}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _id, filter) => {
      const q = String(filter).toLowerCase();
      if (!q) return true;
      const l = row.original;
      return (
        l.name.toLowerCase().includes(q) ||
        (l.email?.toLowerCase().includes(q) ?? false) ||
        (l.phone?.includes(q) ?? false)
      );
    },
  });

  const presetButtons: { id: Preset; label: string }[] = [
    { id: "all", label: "Tümü" },
    { id: "hot", label: "Sıcak (50+)" },
    { id: "today", label: "Bugün eklenen" },
    { id: "mine", label: "Sahibim" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead'ler"
        description="Filtreleyin, sıralayın ve detaya gidin."
        action={uid ? <LeadFormDialog ownerId={uid} /> : null}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtreler</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {presetButtons.map((p) => (
              <Button
                key={p.id}
                type="button"
                size="sm"
                variant={preset === p.id ? "default" : "outline"}
                onClick={() => setPreset(p.id)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
            <Input
              placeholder="Ara (isim, e-posta, telefon)…"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="md:max-w-xs"
              aria-label="Lead ara"
            />
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v ?? "all")}
            >
              <SelectTrigger className="md:w-44">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm türler</SelectItem>
                {LEAD_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {LABELS.leadType[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tags.length > 0 ? (
              <Select
                value={tagFilter}
                onValueChange={(v) => setTagFilter(v ?? "all")}
              >
                <SelectTrigger className="md:w-44">
                  <SelectValue placeholder="Etiket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm etiketler</SelectItem>
                  {tags.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <Select
              value={sourceFilter}
              onValueChange={(v) => setSourceFilter(v ?? "all")}
            >
              <SelectTrigger className="md:w-44">
                <SelectValue placeholder="Kaynak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm kaynaklar</SelectItem>
                {LEAD_SOURCES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {LABELS.source[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <EmptyState title="Kayıt yok" description="Filtreleri gevşetin veya yeni lead ekleyin." />
        ) : (
          filtered.map((l) => (
            <Card key={l.id}>
              <CardContent className="flex items-start justify-between gap-2 p-4">
                <div>
                  <Link href={`/leads/${l.id}`} className="font-medium hover:underline">
                    {l.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {LABELS.leadType[l.type]} · skor {l.score}
                  </p>
                </div>
                <StatusBadge tone={leadScoreTone(l.score)}>{l.score}</StatusBadge>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} scope="col">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="group">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Kayıt yok.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
