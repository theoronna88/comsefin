import redis from "./redis";

export async function storeRedisToken(params: {
  sessionId: string;
  accessToken: string;
}) {
  const { sessionId, accessToken } = params;
  if (!sessionId || !accessToken) return;

  await redis.set(`session:${sessionId}`, accessToken, "EX", 1200);
}
