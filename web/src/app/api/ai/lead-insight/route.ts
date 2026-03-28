import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import {
  canAccessLead,
  fetchUserRole,
  verifyIdTokenFromRequest,
} from "@/lib/server/firebase-user";
import { getAdminDb } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toIso(ts: Timestamp | Date | undefined | null): string | null {
  if (!ts) return null;
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (ts instanceof Date) return ts.toISOString();
  return null;
}

export async function POST(request: Request) {
  const user = await verifyIdTokenFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  let body: { leadId?: string; mode?: string; noteText?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });
  }

  const leadId = body.leadId?.trim();
  if (!leadId) {
    return NextResponse.json({ error: "leadId gerekli" }, { status: 400 });
  }

  const role = await fetchUserRole(user.uid);
  if (!(await canAccessLead(user.uid, role, leadId))) {
    return NextResponse.json({ error: "Bu lead için yetkiniz yok" }, { status: 403 });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY tanımlı değil" },
      { status: 503 }
    );
  }

  const db = getAdminDb();
  const leadSnap = await db.collection("leads").doc(leadId).get();
  const lead = leadSnap.data();
  if (!lead) {
    return NextResponse.json({ error: "Lead bulunamadı" }, { status: 404 });
  }

  const actSnap = await db
    .collection("activities")
    .where("relatedType", "==", "lead")
    .where("relatedId", "==", leadId)
    .orderBy("activityDate", "desc")
    .limit(25)
    .get();

  const activities = actSnap.docs.map((d) => {
    const a = d.data();
    return {
      type: a.activityType,
      date: toIso(a.activityDate as Timestamp),
      content: String(a.content ?? "").slice(0, 500),
    };
  });

  const mode = body.mode === "polish_note" ? "polish_note" : "insight";

  const leadContext = {
    name: lead.name,
    type: lead.type,
    source: lead.source,
    educationStage: lead.educationStage,
    notes: String(lead.notes ?? "").slice(0, 4000),
    score: lead.score,
    interest: lead.interest,
    needNote: lead.needNote,
  };

  let system: string;
  let userContent: string;

  if (mode === "polish_note") {
    const noteText = String(body.noteText ?? "").trim();
    if (!noteText) {
      return NextResponse.json({ error: "noteText gerekli" }, { status: 400 });
    }
    system =
      "Sen bir CRM asistanısın. Kullanıcının satış notunu Türkçe olarak profesyonel, net ve kısa biçimde düzenle. Sadece düzenlenmiş metni döndür; markdown kullanma.";
    userContent = `Orijinal not:\n${noteText.slice(0, 8000)}`;
  } else {
    system = `Sen bir eğitim ve kurumsal satış CRM asistanısın. Yanıtı her zaman geçerli JSON olarak ver, başka metin ekleme. Şema:
{"summary":"string (Türkçe, 2-4 cümle lead özeti)","suggestedNextAction":"string (Türkçe, somut sonraki adım)","suggestedTaskType":"call|message|meeting|follow_up|check_payment|send_proposal|note"}`;
    userContent = `Lead verisi (JSON):\n${JSON.stringify(leadContext, null, 2)}\n\nSon aktiviteler (en yeni önce):\n${JSON.stringify(activities, null, 2)}`;
  }

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
      temperature: 0.4,
      max_tokens: mode === "polish_note" ? 800 : 600,
    }),
  });

  if (!openaiRes.ok) {
    const errText = await openaiRes.text();
    console.error("OpenAI error", openaiRes.status, errText);
    return NextResponse.json(
      { error: "AI servisi yanıt vermedi" },
      { status: 502 }
    );
  }

  const openaiJson = (await openaiRes.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = openaiJson.choices?.[0]?.message?.content?.trim() ?? "";

  if (mode === "polish_note") {
    return NextResponse.json({ polishedNote: text });
  }

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text) as {
      summary?: string;
      suggestedNextAction?: string;
      suggestedTaskType?: string;
    };
    return NextResponse.json({
      summary: parsed.summary ?? "",
      suggestedNextAction: parsed.suggestedNextAction ?? "",
      suggestedTaskType: parsed.suggestedTaskType ?? "follow_up",
    });
  } catch {
    return NextResponse.json({
      summary: text,
      suggestedNextAction: "",
      suggestedTaskType: "follow_up",
    });
  }
}
