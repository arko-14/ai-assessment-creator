import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
    if (!env.mongoUri) {
        console.error("[DB] Environment Variables Check:", {
            MONGODB_URI: !!process.env.MONGODB_URI,
            MONGODB_URL: !!process.env.MONGODB_URL,
            DATABASE_URL: !!process.env.DATABASE_URL,
            MONGO_URL: !!process.env.MONGO_URL,
        });
        throw new Error("No MongoDB connection string found! If using Railway, make sure to add it to your service Variables.");
    }
    console.log(`[DB] Connecting to MongoDB (Scheme: ${env.mongoUri.split(":")[0]}...)`);
    await mongoose.connect(env.mongoUri);
    console.log("[DB] MongoDB connected successfully");
}