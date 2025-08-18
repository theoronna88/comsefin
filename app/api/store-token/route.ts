import { cookies } from "next/headers";
import redis from "@/app/_lib/redis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { access_token, sessionId } = body;

  if (!access_token) {
    return new Response("access_token ausente", { status: 400 });
  }

  await redis.set(`session:${sessionId}`, access_token, "EX", 1200);

  cookies().set("session_id", sessionId, {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 1200, // 20 minutos em segundos
  });

  return NextResponse.json({ ok: true });
}
