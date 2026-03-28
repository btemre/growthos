import { NextResponse } from "next/server";

/** Build sırasında boş kalsa bile App Hosting runtime env burada dolu olur. */
export const dynamic = "force-dynamic";

function pick(key: string): string {
  return (process.env[key] ?? "").trim();
}

export async function GET() {
  const body = {
    apiKey: pick("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: pick("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: pick("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: pick("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: pick("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: pick("NEXT_PUBLIC_FIREBASE_APP_ID"),
  };

  return NextResponse.json(body);
}
