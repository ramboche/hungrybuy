import { Role } from "@prisma/client";
import { redis } from "./redis";

const ACCESS_TTL_SECONDS = 15 * 60;

export async function storeSession(
  sessionId: string,
  userId: string,
  role: Role,
) {
  const key = `session:${sessionId}`;

  await redis.set(
    key,
    JSON.stringify({ userId, role }),
    "EX",
    ACCESS_TTL_SECONDS,
  );
}

export async function getSession(sessionId: string) {
  const key = `session:${sessionId}`;

  const data = await redis.get(key);
  if (!data) return null;

  return JSON.parse(data) as {
    userId: string;
    role: Role;
  };
}

export async function deleteSession(sessionId: string) {
  const key = `session:${sessionId}`;
  await redis.del(key);
}
