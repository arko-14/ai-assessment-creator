import IORedis from "ioredis";
import { env } from "./env";

export const redisConnection = new IORedis(env.redisUrl, {
    maxRetriesPerRequest: null,
});

redisConnection.on("error", (err) => console.error("[Redis Connection] Error:", err));