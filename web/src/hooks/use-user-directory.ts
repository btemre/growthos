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

  // Memoize resolveOwner to prevent reference change on every hook execution.
  const resolveOwner = useCallback(
    (ownerId: string, currentUid?: string): string => {
      if (currentUid && ownerId === currentUid) return "Siz";
      if (isAdmin) return names.get(ownerId) ?? `${ownerId.slice(0, 8)}…`;
      return `${ownerId.slice(0, 8)}…`;
    },
    [names, isAdmin]
  );

  // Memoize the return object so that downstream components/hooks do not re-render.
  return useMemo(() => ({ resolveOwner }), [resolveOwner]);
}
