import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  canAccessLead,
  fetchUserRole,
  verifyIdTokenFromRequest,
} from "@/lib/server/firebase-user";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { logActivityAdmin } from "@/lib/server/log-activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await verifyIdTokenFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!apiKey || !from) {
    return NextResponse.json(
      { error: "RESEND_API_KEY veya RESEND_FROM tanımlı değil" },
      { status: 503 }
    );
  }

  let body: { leadId?: string; subject?: string; text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }

  const leadId = body.leadId?.trim();
  const subject = body.subject?.trim();
  const text = body.text?.trim();
  if (!leadId || !subject || !text) {
    return NextResponse.json(
      { error: "leadId, subject ve text gerekli" },
      { status: 400 }
    );
  }

  const role = await fetchUserRole(user.uid);
  if (!(await canAccessLead(user.uid, role, leadId))) {
    return NextResponse.json({ error: "Bu lead için yetkiniz yok" }, { status: 403 });
  }

  const leadSnap = await getAdminDb().collection("leads").doc(leadId).get();
  const lead = leadSnap.data();
  const to = String(lead?.email ?? "").trim();
  if (!to) {
    return NextResponse.json(
      { error: "Lead e-posta adresi yok" },
      { status: 400 }
    );
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
  });

  if (error) {
    console.error("Resend error", error);
    return NextResponse.json(
      { error: error.message ?? "E-posta gönderilemedi" },
      { status: 502 }
    );
  }

  await logActivityAdmin({
    userId: user.uid,
    relatedType: "lead",
    relatedId: leadId,
    activityType: "email",
    content: `E-posta gönderildi: ${subject}\n${text.slice(0, 2000)}`,
  });

  return NextResponse.json({ ok: true, id: data?.id ?? null });
}
