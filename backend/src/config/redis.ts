import IORedis from "ioredis";
import { env } from "./env";

console.log("[Redis] Initializing main IORedis connection...");

export const redisConnection = new IORedis(env.redisUrl, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redisConnection.on("error", (err) => {
    console.error("[IORedis Global Error]:", err);
});

redisConnection.on("connect", () => {
    console.log("[IORedis] Connected to Redis");
});