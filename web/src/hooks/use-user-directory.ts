"use client";

import { useCallback, useEffect, useState } from "react";
import { getFirebaseDb } from "@/lib/firebase/client";
import { listUsers } from "@/lib/firestore/users";

// Module-level cache to deduplicate user directory fetches across component mounts
let userDirectoryPromise: Promise<Map<string, string>> | null = null;

function getUserDirectoryMap(): Promise<Map<string, string>> {
  if (!userDirectoryPromise) {
    const db = getFirebaseDb();
    userDirectoryPromise = listUsers(db)
      .then((users) => {
        const m = new Map<string, string>();
        for (const u of users) m.set(u.id, u.name);
        return m;
      })
      .catch((err) => {
        // Reset promise on failure to allow retry on subsequent mounts
        userDirectoryPromise = null;
        console.error("Failed to load user directory", err);
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

    getUserDirectoryMap().then((map) => {
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
