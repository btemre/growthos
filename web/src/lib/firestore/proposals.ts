import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import type { Proposal, ProposalStatus } from "@/types/models";
import { proposalFromDoc } from "./serialize";

const DEAL_ID_CHUNK = 10;

function mergeById(
  chunks: Proposal[][],
  sortDesc: (a: Proposal, b: Proposal) => number
): Proposal[] {
  const map = new Map<string, Proposal>();
  for (const list of chunks) {
    for (const p of list) {
      map.set(p.id, p);
    }
  }
  return [...map.values()].sort(sortDesc);
}

/** Admin: all proposals. Business dev: pass deal IDs you own (chunked `in` queries). */
export function subscribeProposals(
  db: Firestore,
  options: { isAdmin: boolean; dealIds: string[] },
  onData: (proposals: Proposal[]) => void,
  onError?: (e: Error) => void
): Unsubscribe {
  const sortDesc = (a: Proposal, b: Proposal) => {
    const ta = a.updatedAt?.getTime() ?? 0;
    const tb = b.updatedAt?.getTime() ?? 0;
    return tb - ta;
  };

  if (options.isAdmin) {
    const q = query(collection(db, "proposals"), orderBy("updatedAt", "desc"));
    return onSnapshot(
      q,
      (snap) =>
        onData(snap.docs.map((d) => proposalFromDoc(d.id, d.data()))),
      (err) => onError?.(err as Error)
    );
  }

  const ids = [...new Set(options.dealIds)].filter(Boolean);
  if (ids.length === 0) {
    onData([]);
    return () => {};
  }

  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += DEAL_ID_CHUNK) {
    chunks.push(ids.slice(i, i + DEAL_ID_CHUNK));
  }

  const latest: Proposal[][] = chunks.map(() => []);
  let unsubscribers: Unsubscribe[] = [];

  const emit = () => {
    onData(mergeById(latest, sortDesc));
  };

  unsubscribers = chunks.map((chunk, idx) => {
    const q = query(
      collection(db, "proposals"),
      where("dealId", "in", chunk),
      orderBy("updatedAt", "desc")
    );
    return onSnapshot(
      q,
      (snap) => {
        latest[idx] = snap.docs.map((d) => proposalFromDoc(d.id, d.data()));
        emit();
      },
      (err) => onError?.(err as Error)
    );
  });

  return () => {
    unsubscribers.forEach((u) => u());
  };
}

export async function createProposal(
  db: Firestore,
  input: {
    dealId: string;
    title: string;
    scope: string;
    price?: number;
    status?: ProposalStatus;
    validUntil?: Date | null;
    customerName?: string;
    deliveryNote?: string;
    optionalModules?: string;
    createdBy?: string;
  }
): Promise<string> {
  const now = serverTimestamp();
  const ref = await addDoc(collection(db, "proposals"), {
    dealId: input.dealId,
    title: input.title,
    scope: input.scope,
    price: input.price,
    status: input.status ?? "draft",
    validUntil: input.validUntil ?? null,
    sentAt: null,
    customerName: input.customerName,
    deliveryNote: input.deliveryNote,
    optionalModules: input.optionalModules,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateProposal(
  db: Firestore,
  proposalId: string,
  patch: Partial<{
    title: string;
    scope: string;
    price: number | undefined;
    status: ProposalStatus;
    validUntil: Date | null;
    sentAt: Date | null;
    customerName: string;
    deliveryNote: string;
    optionalModules: string;
  }>,
  options?: { setSentAtIfStatusSent?: boolean }
): Promise<void> {
  const extra: Record<string, unknown> = {};
  if (
    options?.setSentAtIfStatusSent &&
    patch.status === "sent" &&
    patch.sentAt === undefined
  ) {
    extra.sentAt = serverTimestamp();
  }
  const data = Object.fromEntries(
    Object.entries({ ...patch, ...extra }).filter(
      ([, v]) => v !== undefined
    )
  );
  await updateDoc(doc(db, "proposals", proposalId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
