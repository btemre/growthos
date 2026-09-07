"use client";

import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
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
import { Skeleton } from "@/components/ui/skeleton";
import { LABELS, TASK_TYPES } from "@/lib/constants";
import type { TaskType } from "@/types/models";

export function LeadAiPanel({
  aiBusy,
  aiSummary,
  aiAction,
  aiTaskType,
  setAiTaskType,
  coerceTaskType,
  onFetchInsight,
  onCreateTask,
}: {
  aiBusy: boolean;
  aiSummary: string;
  aiAction: string;
  aiTaskType: TaskType;
  setAiTaskType: (t: TaskType) => void;
  coerceTaskType: (raw: string) => TaskType;
  onFetchInsight: () => void;
  onCreateTask: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Özet ve sonraki adım</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Notlar ve son aktivitelere göre kısa özet ve önerilen aksiyon.
        </p>
        <Button type="button" disabled={aiBusy} onClick={onFetchInsight}>
          {aiBusy ? (
            <>
              <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
              <span>Çalışıyor…</span>
            </>
          ) : (
            "Öneri üret"
          )}
        </Button>
        {aiBusy && !aiSummary ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : null}
        {aiSummary ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">Özet</p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  void navigator.clipboard.writeText(aiSummary);
                  toast.success("Kopyalandı");
                }}
              >
                Kopyala
              </Button>
            </div>
            <p className="whitespace-pre-wrap rounded-md border bg-card/50 p-3">
              {aiSummary}
            </p>
          </div>
        ) : null}
        {aiAction ? (
          <div className="space-y-2">
            <p className="font-medium">Önerilen aksiyon</p>
            <p className="whitespace-pre-wrap rounded-md border bg-card/50 p-3">
              {aiAction}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="ai-task-type" className="text-xs">
                Görev tipi
              </Label>
              <Select
                value={aiTaskType}
                onValueChange={(v) => v && setAiTaskType(coerceTaskType(v))}
              >
                <SelectTrigger id="ai-task-type" className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {LABELS.taskType[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="secondary" onClick={onCreateTask}>
                Görev oluştur
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
