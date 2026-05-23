import { Suspense } from "react";
import { TasksPageClient } from "@/components/tasks/tasks-page-client";
import { PageSkeleton } from "@/components/shared/loading-skeleton";

export default function TasksPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TasksPageClient />
    </Suspense>
  );
}
