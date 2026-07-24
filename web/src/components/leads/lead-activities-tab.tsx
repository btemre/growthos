"use client";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ACTIVITY_TYPES, LABELS } from "@/lib/constants";
import { ACTIVITY_TEMPLATES } from "@/lib/activity-templates";
import type { Activity, ActivityType } from "@/types/models";

export function LeadActivitiesTab({
  activities,
  activityType,
  setActivityType,
  activityContent,
  setActivityContent,
  onAdd,
  onTemplate,
}: {
  activities: Activity[];
  activityType: ActivityType;
  setActivityType: (t: ActivityType) => void;
  activityContent: string;
  setActivityContent: (v: string) => void;
  onAdd: () => void;
  onTemplate: (type: ActivityType, content: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Yeni aktivite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TEMPLATES.map((tpl) => (
              <Button
                key={tpl.label}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onTemplate(tpl.activityType, tpl.content)}
              >
                {tpl.label}
              </Button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="activity-type-select" className="text-xs font-medium">
              Aktivite tipi
            </Label>
            <Select
              value={activityType}
              onValueChange={(v) => v && setActivityType(v as ActivityType)}
            >
              <SelectTrigger id="activity-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {LABELS.activityType[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            rows={3}
            placeholder="Ne yapıldı?"
            value={activityContent}
            onChange={(e) => setActivityContent(e.target.value)}
          />
          <Button type="button" onClick={onAdd}>
            Ekle
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {activities.map((a) => (
          <div key={a.id} className="rounded-lg border bg-card/50 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>
                {a.activityDate
                  ? format(a.activityDate, "d MMM yyyy HH:mm", { locale: tr })
                  : "—"}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {LABELS.activityType[a.activityType]}
              </Badge>
            </div>
            <p className="mt-2 whitespace-pre-wrap">{a.content}</p>
          </div>
        ))}
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz aktivite yok.</p>
        ) : null}
      </div>
    </div>
  );
}
