"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { getFirebaseDb } from "@/lib/firebase/client";

type Tag = { id: string; name: string; color?: string };

export function LeadTags({ tagIds }: { tagIds?: string[] }) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const db = getFirebaseDb();
    return onSnapshot(collection(db, "tags"), (snap) => {
      setTags(
        snap.docs.map((d) => ({
          id: d.id,
          name: String(d.data().name ?? d.id),
          color: d.data().color as string | undefined,
        }))
      );
    });
  }, []);

  if (!tagIds?.length) return null;

  const matched = tags.filter((t) => tagIds.includes(t.id));
  if (matched.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1" aria-label="Etiketler">
      {matched.map((t) => (
        <li key={t.id}>
          <Badge
            variant="outline"
            style={t.color ? { borderColor: t.color, color: t.color } : undefined}
          >
            {t.name}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
