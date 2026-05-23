import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { UserSearch } from "lucide-react";

export default function LeadNotFound() {
  return (
    <EmptyState
      icon={UserSearch}
      title="Lead bulunamadı"
      description="Bu kayıt silinmiş veya erişim izniniz olmayabilir."
      action={
        <Link href="/leads" className={cn(buttonVariants({ variant: "outline" }))}>
          Lead listesine dön
        </Link>
      }
    />
  );
}
