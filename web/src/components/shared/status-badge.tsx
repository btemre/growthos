import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone =
  | "hot"
  | "active"
  | "success"
  | "warning"
  | "danger"
  | "muted";

const toneClass: Record<StatusTone, string> = {
  hot: "border-[var(--semantic-hot)]/40 bg-[var(--semantic-hot)]/10 text-[var(--semantic-hot)]",
  active:
    "border-[var(--semantic-active)]/40 bg-[var(--semantic-active)]/10 text-[var(--semantic-active)]",
  success:
    "border-[var(--semantic-success)]/40 bg-[var(--semantic-success)]/10 text-[var(--semantic-success)]",
  warning:
    "border-[var(--semantic-warning)]/40 bg-[var(--semantic-warning)]/10 text-[var(--semantic-warning)]",
  danger:
    "border-destructive/40 bg-destructive/10 text-destructive",
  muted: "",
};

export function StatusBadge({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <Badge
      variant={tone === "muted" ? "secondary" : "outline"}
      className={cn(tone !== "muted" && toneClass[tone], className)}
    >
      {children}
    </Badge>
  );
}

export function leadScoreTone(score: number): StatusTone {
  if (score >= 70) return "hot";
  if (score >= 40) return "active";
  return "muted";
}

export function taskPriorityTone(priority?: string): StatusTone {
  if (priority === "high") return "danger";
  if (priority === "medium") return "warning";
  return "muted";
}
