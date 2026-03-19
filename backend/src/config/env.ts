import dotenv from "dotenv";
dotenv.config();

export const env = {
    port: Number(process.env.PORT || 8080),
    mongoUri: process.env.MONGODB_URI || "",
    redisUrl: process.env.REDIS_URL || "",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    groqApiKey: process.env.GROQ_API_KEY || "",
};