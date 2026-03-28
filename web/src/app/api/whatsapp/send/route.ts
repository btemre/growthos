import { NextResponse } from "next/server";
import {
  canAccessLead,
  fetchUserRole,
  verifyIdTokenFromRequest,
} from "@/lib/server/firebase-user";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { logActivityAdmin } from "@/lib/server/log-activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeWaRecipient(phone: string, whatsapp?: string): string {
  const raw = (whatsapp || phone || "").replace(/\D/g, "");
  if (!raw) return "";
  if (raw.startsWith("0")) return `90${raw.slice(1)}`;
  return raw;
}

export async function POST(request: Request) {
  const user = await verifyIdTokenFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  if (!token || !phoneId) {
    return NextResponse.json(
      { error: "WhatsApp API ortam değişkenleri eksik" },
      { status: 503 }
    );
  }

  let body: { leadId?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }

  const leadId = body.leadId?.trim();
  const message = body.message?.trim();
  if (!leadId || !message) {
    return NextResponse.json(
      { error: "leadId ve message gerekli" },
      { status: 400 }
    );
  }

  const role = await fetchUserRole(user.uid);
  if (!(await canAccessLead(user.uid, role, leadId))) {
    return NextResponse.json({ error: "Bu lead için yetkiniz yok" }, { status: 403 });
  }

  const leadSnap = await getAdminDb().collection("leads").doc(leadId).get();
  const lead = leadSnap.data();
  const to = normalizeWaRecipient(
    String(lead?.phone ?? ""),
    lead?.whatsapp as string | undefined
  );
  if (!to) {
    return NextResponse.json(
      { error: "Lead telefon veya WhatsApp numarası yok" },
      { status: 400 }
    );
  }

  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
  const graphRes = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message.slice(0, 4096) },
    }),
  });

  const graphJson = await graphRes.json().catch(() => ({}));
  if (!graphRes.ok) {
    console.error("WhatsApp Graph error", graphJson);
    return NextResponse.json(
      {
        error:
          (graphJson as { error?: { message?: string } }).error?.message ??
          "WhatsApp gönderilemedi",
      },
      { status: 502 }
    );
  }

  await logActivityAdmin({
    userId: user.uid,
    relatedType: "lead",
    relatedId: leadId,
    activityType: "whatsapp",
    content: `WhatsApp gönderildi (${to}): ${message.slice(0, 1500)}`,
  });

  return NextResponse.json({ ok: true, graph: graphJson });
}
