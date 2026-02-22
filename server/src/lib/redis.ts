import Redis from "ioredis";
import { logger } from "./logger";

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

redis.on("connect", () => {
  logger.info("redis connected");
});

redis.on("error", (error: any) => {
  logger.error("redis error", error);
});
