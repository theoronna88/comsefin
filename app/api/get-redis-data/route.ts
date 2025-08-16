import { cookies } from "next/headers";
import redis from "@/app/_lib/redis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Obter o sessionId do cookie
    const cookieStore = cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID não encontrado" },
        { status: 400 }
      );
    }

    // Buscar o token no Redis usando o sessionId
    const accessToken = await redis.get(`session:${sessionId}`);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Token não encontrado no Redis" },
        { status: 404 }
      );
    }

    // Buscar todas as chaves do Redis para debug (opcional)
    const allKeys = await redis.keys("session:*");

    // Retornar os dados
    return NextResponse.json({
      sessionId,
      accessToken,
      allSessionKeys: allKeys,
      message: "Dados recuperados com sucesso do Redis",
    });
  } catch (error) {
    console.error("Erro ao acessar Redis:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
