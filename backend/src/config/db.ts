import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
    if (!env.mongoUri) {
        throw new Error("MONGODB_URI is not defined! Please check your Railway environment variables.");
    }
    console.log(`Connecting to MongoDB (Scheme: ${env.mongoUri.split(":")[0]}...)`);
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected successfully");
}