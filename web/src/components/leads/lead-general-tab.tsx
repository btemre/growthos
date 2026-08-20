"use client";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EDUCATION_STAGES, LABELS } from "@/lib/constants";
import type { EducationStage, Lead } from "@/types/models";

export function LeadGeneralTab({
  lead,
  notes,
  setNotes,
  score,
  setScore,
  polishDraft,
  setPolishDraft,
  aiBusy,
  onSave,
  onSaveStage,
  onPolishNote,
  onOpenEmail,
  onOpenWhatsApp,
}: {
  lead: Lead;
  notes: string;
  setNotes: (v: string) => void;
  score: number;
  setScore: (v: number) => void;
  polishDraft: string;
  setPolishDraft: (v: string) => void;
  aiBusy: boolean;
  onSave: () => void;
  onSaveStage: (s: EducationStage) => void;
  onPolishNote: () => void;
  onOpenEmail: () => void;
  onOpenWhatsApp: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">İletişim</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-muted-foreground">E-posta</p>
            <p className="font-medium truncate">{lead.email ?? "—"}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={!lead.email?.trim()}
              onClick={onOpenEmail}
              aria-label={
                lead.email
                  ? `${lead.name} kişisine e-posta gönder (${lead.email})`
                  : "E-posta gönder"
              }
            >
              E-posta gönder
            </Button>
          </div>
          <div>
            <p className="text-muted-foreground">Telefon</p>
            <p className="font-medium truncate">{lead.phone ?? "—"}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={!lead.phone?.trim() && !lead.whatsapp?.trim()}
              onClick={onOpenWhatsApp}
              aria-label={
                lead.phone || lead.whatsapp
                  ? `${lead.name} kişisine WhatsApp mesajı gönder`
                  : "WhatsApp gönder"
              }
            >
              WhatsApp gönder
            </Button>
          </div>
          <div>
            <p className="text-muted-foreground">Şehir</p>
            <p className="font-medium">{lead.city ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Son temas</p>
            <p className="font-medium">
              {lead.lastContactAt
                ? format(lead.lastContactAt, "d MMMM yyyy HH:mm", { locale: tr })
                : "—"}
            </p>
          </div>
        </CardContent>
      </Card>
      {lead.type === "education_candidate" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Eğitim aşaması</CardTitle>
          </CardHeader>
          <CardContent
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Eğitim aşaması seçimi"
          >
            {EDUCATION_STAGES.map((s) => (
              <Button
                key={s}
                type="button"
                size="sm"
                variant={lead.educationStage === s ? "default" : "outline"}
                aria-pressed={lead.educationStage === s}
                onClick={() => onSaveStage(s)}
              >
                {LABELS.educationStage[s]}
              </Button>
            ))}
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skor & notlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="lead-score-input">Lead skoru</Label>
            <Input
              id="lead-score-input"
              type="number"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-notes-textarea">Notlar</Label>
            <Textarea
              id="lead-notes-textarea"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={onSave}>
              Kaydet
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={aiBusy || !notes.trim()}
              onClick={onPolishNote}
            >
              Notu AI ile düzenle
            </Button>
          </div>
          {polishDraft ? (
            <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
              <p className="font-medium">AI taslağı</p>
              <p className="whitespace-pre-wrap">{polishDraft}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setNotes(polishDraft);
                  setPolishDraft("");
                }}
              >
                Not alanına aktar
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
