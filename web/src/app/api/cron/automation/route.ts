import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { subDays } from "date-fns";
import { getAdminDb } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Harici zamanlayıcı (ör. cron-job.org) veya Cloud Scheduler bu endpoint'i
 * Authorization: Bearer CRON_SECRET ile çağırır.
 *
 * Kural (basit): educationStage = awaiting_payment ve güncelleme 2+ gün önce;
 * açık check_payment görevi yoksa bir görev oluşturur.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!secret || token !== secret) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const db = getAdminDb();
  const cutoff = Timestamp.fromDate(subDays(new Date(), 2));

  const leadsSnap = await db
    .collection("leads")
    .where("educationStage", "==", "awaiting_payment")
    .limit(80)
    .get();

  let created = 0;
  for (const docSnap of leadsSnap.docs) {
    const data = docSnap.data();
    const updated = data.updatedAt as Timestamp | undefined;
    if (!updated || updated.toMillis() > cutoff.toMillis()) continue;

    const leadId = docSnap.id;
    const ownerId = String(data.ownerId ?? "");
    if (!ownerId) continue;

    const existing = await db
      .collection("tasks")
      .where("relatedType", "==", "lead")
      .where("relatedId", "==", leadId)
      .where("status", "==", "open")
      .limit(12)
      .get();

    const hasCheck = existing.docs.some(
      (d) => d.data().taskType === "check_payment"
    );
    if (hasCheck) continue;

    await db.collection("tasks").add({
      relatedType: "lead",
      relatedId: leadId,
      assignedTo: ownerId,
      title: "Ödeme takibi (otomatik hatırlatma)",
      taskType: "check_payment",
      dueDate: null,
      priority: "medium",
      status: "open",
      notes: "Sistem: ödeme bekleyen aday 2+ gün güncellenmedi.",
      createdAt: FieldValue.serverTimestamp(),
    });
    created += 1;
  }

  return NextResponse.json({ ok: true, tasksCreated: created });
}
