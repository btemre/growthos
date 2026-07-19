"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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

  // Memoize resolveOwner function to prevent unnecessary reference changes
  const resolveOwner = useCallback((ownerId: string, currentUid?: string): string => {
    if (currentUid && ownerId === currentUid) return "Siz";
    if (isAdmin) return names.get(ownerId) ?? `${ownerId.slice(0, 8)}…`;
    return `${ownerId.slice(0, 8)}…`;
  }, [isAdmin, names]);

  // Memoize the returned hook object to avoid cascaded re-renders in hook consumers
  return useMemo(() => ({ resolveOwner }), [resolveOwner]);
}
