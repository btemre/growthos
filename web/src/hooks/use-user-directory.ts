"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getFirebaseDb } from "@/lib/firebase/client";
import { listUsers } from "@/lib/firestore/users";

export function useUserDirectory(isAdmin: boolean) {
  const [names, setNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!isAdmin) return;
    const db = getFirebaseDb();
    listUsers(db)
      .then((users) => {
        const m = new Map<string, string>();
        for (const u of users) m.set(u.id, u.name);
        setNames(m);
      })
      .catch(() => setNames(new Map()));
  }, [isAdmin]);

  // ⚡ Bolt: Memoize resolveOwner helper with useCallback to prevent cascading re-renders in card components like DealCard and LeadCard.
  const resolveOwner = useCallback((ownerId: string, currentUid?: string): string => {
    if (currentUid && ownerId === currentUid) return "Siz";
    if (isAdmin) return names.get(ownerId) ?? `${ownerId.slice(0, 8)}…`;
    return `${ownerId.slice(0, 8)}…`;
  }, [isAdmin, names]);

  // ⚡ Bolt: Memoize returned object with useMemo to ensure stable reference down the component tree.
  return useMemo(() => ({ resolveOwner }), [resolveOwner]);
}
