import { redis } from "../lib/redis";

export function buildMenuCacheKey(query: Record<string, any>) {
  const sorted = Object.keys(query)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = query[key];
        return acc;
      },
      {} as Record<string, any>,
    );

  return `menu:${JSON.stringify(sorted)}`;
}

export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;

  return JSON.parse(data);
}

export async function setCache(key: string, value: unknown, ttl: 60) {
  await redis.set(key, JSON.stringify(value), "EX", ttl);
}

export async function invalidateMenuCache() {
  const stream = redis.scanStream({
    match: "menu:*",
  });

  stream.on("data", async (keys: string[]) => {
    if (keys.length > 0) {
      const pipeline = redis.pipeline();
      keys.forEach((key) => pipeline.del(key));
      await pipeline.exec();
    }
  });
}
