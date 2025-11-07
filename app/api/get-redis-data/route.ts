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
    return NextResponse.json({
      sessionId,
      accessToken,
      allSessionKeys: allKeys,
      message: "Dados recuperados com sucesso do Redis",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const sessionId = session?.user?.id;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID não encontrado" },
        { status: 400 }
      );
    }

    // Verificar se o token existe antes de tentar deletar
    const existingToken = await redis.get(`session:${sessionId}`);

    if (!existingToken) {
      return NextResponse.json(
        { message: "Nenhum token encontrado para deletar" },
        { status: 200 }
      );
    }

    // Deletar o token do Redis
    const deletedCount = await redis.del(`session:${sessionId}`);

    if (deletedCount > 0) {
      return NextResponse.json({
        message: "Token removido do Redis com sucesso",
        sessionId,
        deletedKeys: deletedCount,
      });
    } else {
      return NextResponse.json(
        { error: "Falha ao remover token do Redis" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro ao deletar token do Redis:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao deletar token", details: error },
      { status: 500 }
    );
  }
}
