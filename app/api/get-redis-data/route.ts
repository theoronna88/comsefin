import redis from "@/app/_lib/redis";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const sessionId = session?.user?.id;
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID não encontrado" },
        { status: 400 }
      );
    }
    const accessToken = await redis.get(`session:${sessionId}`);
    if (!accessToken) {
      return NextResponse.json(
        { error: "Token não encontrado no Redis" },
        { status: 404 }
      );
    }

    const allKeys = await redis.keys("session:*");
    https: return NextResponse.json({
      sessionId,
      accessToken,
      allSessionKeys: allKeys,
      message: "Dados recuperados com sucesso do Redis",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor ", with: error },
      { status: 500 }
    );
  }
}
