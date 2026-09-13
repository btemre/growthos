"use client";

import { useCallback, useEffect, useState } from "react";
import { getFirebaseDb } from "@/lib/firebase/client";
import { listUsers } from "@/lib/firestore/users";

// Global in-memory promise cache for user directory to deduplicate requests across component mounts
let userDirectoryPromise: Promise<Map<string, string>> | null = null;

export function useUserDirectory(isAdmin: boolean) {
  const [names, setNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!isAdmin) return;

    if (!userDirectoryPromise) {
      const db = getFirebaseDb();
      userDirectoryPromise = listUsers(db)
        .then((users) => {
          const m = new Map<string, string>();
          for (const u of users) m.set(u.id, u.name);
          return m;
        })
        .catch((err) => {
          console.error("Failed to fetch user directory:", err);
          userDirectoryPromise = null; // Reset on error to allow subsequent retry
          return new Map<string, string>();
        });
    }

    let isMounted = true;
    userDirectoryPromise.then((userMap) => {
      if (isMounted) {
        setNames(userMap);
      }
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
