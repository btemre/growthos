"use client";

import { useCallback, useEffect, useState } from "react";
import { getFirebaseDb } from "@/lib/firebase/client";
import { listUsers } from "@/lib/firestore/users";

// Cache the promise at module scope to deduplicate network requests across component mounts
let userDirectoryPromise: Promise<Map<string, string>> | null = null;

function fetchUserDirectory(): Promise<Map<string, string>> {
  if (!userDirectoryPromise) {
    const db = getFirebaseDb();
    userDirectoryPromise = listUsers(db)
      .then((users) => {
        const m = new Map<string, string>();
        for (const u of users) m.set(u.id, u.name);
        return m;
      })
      .catch((err) => {
        // Clear promise on failure so subsequent attempts can retry
        userDirectoryPromise = null;
        console.error("Failed to fetch user directory:", err);
        return new Map<string, string>();
      });
  }
  return userDirectoryPromise;
}

export function useUserDirectory(isAdmin: boolean) {
  const [names, setNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!isAdmin) return;
    let isMounted = true;
    fetchUserDirectory().then((map) => {
      if (isMounted) setNames(map);
    });
    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const resolveOwner = useCallback(
    (ownerId: string, currentUid?: string): string => {
      if (currentUid && ownerId === currentUid) return "Siz";
      if (isAdmin) return names.get(ownerId) ?? `${ownerId.slice(0, 8)}…`;
      return `${ownerId.slice(0, 8)}…`;
    },
    [isAdmin, names]
  );

  return { resolveOwner };
}
