import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const generationQueue = new Queue("assignment-generation", {
    connection: redisConnection as any,
});