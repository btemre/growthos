import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { FieldValue, Timestamp, type Firestore } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { logActivityAdmin } from "@/lib/server/log-activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeDigits(v: string): string {
  return v.replace(/\D/g, "");
}

/** Meta webhook doğrulama (abonelik kurulumu). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_VERIFY_TOKEN?.trim();
  if (mode === "subscribe" && token && expected && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET?.trim();
  if (!secret || !signature?.startsWith("sha256=")) return false;
  const expected =
    "sha256=" +
    createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

async function findLeadIdByPhone(db: Firestore, waId: string): Promise<string | null> {
  const d = normalizeDigits(waId);
  if (!d) return null;
  const variants = new Set<string>([d]);
  if (d.length > 10) variants.add(d.slice(-10));
  if (d.startsWith("90") && d.length >= 12) variants.add(`0${d.slice(2)}`);
  for (const v of variants) {
    for (const field of ["whatsapp", "phone"] as const) {
      const snap = await db.collection("leads").where(field, "==", v).limit(1).get();
      if (!snap.empty) return snap.docs[0]!.id;
      const snapPlus = await db
        .collection("leads")
        .where(field, "==", `+${v}`)
        .limit(1)
        .get();
      if (!snapPlus.empty) return snapPlus.docs[0]!.id;
    }
  }
  return null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const sig = request.headers.get("x-hub-signature-256");
  if (!verifySignature(rawBody, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const db = getAdminDb();
  const entries =
    (payload as { entry?: { changes?: { value?: { messages?: unknown[] } }[] }[] })
      .entry ?? [];

  for (const ent of entries) {
    for (const ch of ent.changes ?? []) {
      const messages = ch.value?.messages as
        | { from?: string; text?: { body?: string }; type?: string }[]
        | undefined;
      if (!messages?.length) continue;
      for (const msg of messages) {
        if (msg.type !== "text") continue;
        const from = String(msg.from ?? "");
        const text = String(msg.text?.body ?? "").trim();
        if (!from || !text) continue;

        const leadId = await findLeadIdByPhone(db, from);
        if (leadId) {
          await logActivityAdmin({
            userId: "system_whatsapp",
            relatedType: "lead",
            relatedId: leadId,
            activityType: "whatsapp",
            content: `Gelen WhatsApp (${from}): ${text.slice(0, 2000)}`,
          });
        } else {
          await db.collection("whatsapp_inbound_unmatched").add({
            waId: from,
            text: text.slice(0, 4000),
            receivedAt: Timestamp.now(),
            createdAt: FieldValue.serverTimestamp(),
          });
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
