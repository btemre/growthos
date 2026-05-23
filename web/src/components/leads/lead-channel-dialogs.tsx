"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function LeadChannelDialogs({
  emailOpen,
  setEmailOpen,
  emailSubject,
  setEmailSubject,
  emailBody,
  setEmailBody,
  waOpen,
  setWaOpen,
  waBody,
  setWaBody,
  channelBusy,
  onSendEmail,
  onSendWhatsApp,
}: {
  emailOpen: boolean;
  setEmailOpen: (v: boolean) => void;
  emailSubject: string;
  setEmailSubject: (v: string) => void;
  emailBody: string;
  setEmailBody: (v: string) => void;
  waOpen: boolean;
  setWaOpen: (v: boolean) => void;
  waBody: string;
  setWaBody: (v: string) => void;
  channelBusy: boolean;
  onSendEmail: () => void;
  onSendWhatsApp: () => void;
}) {
  return (
    <>
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>E-posta gönder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-2">
              <Label>Konu</Label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Konu"
              />
            </div>
            <div className="space-y-2">
              <Label>Metin</Label>
              <Textarea
                rows={6}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Mesajınız…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" disabled={channelBusy} onClick={onSendEmail}>
              {channelBusy ? "Gönderiliyor…" : "Gönder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={waOpen} onOpenChange={setWaOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>WhatsApp mesajı</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Meta politikası: sohbet penceresi dışında şablon mesajı gerekir.
          </p>
          <div className="space-y-2 py-2">
            <Label>Mesaj</Label>
            <Textarea
              rows={5}
              value={waBody}
              onChange={(e) => setWaBody(e.target.value)}
              placeholder="Mesajınız…"
            />
          </div>
          <DialogFooter>
            <Button type="button" disabled={channelBusy} onClick={onSendWhatsApp}>
              {channelBusy ? "Gönderiliyor…" : "Gönder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
