import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Emitter } from "@socket.io/redis-emitter";
import { createClient } from "redis";
import { env } from "../config/env";

let io: Server;
let emitter: Emitter;

export async function initSocket(server: HttpServer) {
    console.log("[Socket] Initializing with Redis...");
    const pubClient = createClient({ url: env.redisUrl });
    const subClient = pubClient.duplicate();

    // Add error handlers BEFORE connecting
    pubClient.on("error", (err) => console.error("[Redis Pub Client Error]:", err));
    subClient.on("error", (err) => console.error("[Redis Sub Client Error]:", err));

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io = new Server(server, {
        cors: {
            origin: env.frontendUrl,
            methods: ["GET", "POST"],
        },
    });

    console.log("[Socket] Setting up Redis adapter...");
    io.adapter(createAdapter(pubClient, subClient));

    io.on("connection", (socket) => {
        socket.on("assignment:join", (assignmentId: string) => {
            console.log(`[Socket] Client joining room: ${assignmentId}`);
            socket.join(assignmentId);
        });
    });

    return io;
}

export async function getEmitter() {
    if (emitter) return emitter;
    console.log("[Socket] Creating Redis Emitter...");
    const redisClient = createClient({ url: env.redisUrl });

    redisClient.on("error", (err) => console.error("[Redis Emitter Client Error]:", err));

    await redisClient.connect();
    emitter = new Emitter(redisClient);
    return emitter;
}

export async function emitAssignmentUpdate(
    assignmentId: string,
    payload: Record<string, unknown>
) {
    try {
        if (io) {
            io.to(assignmentId).emit("assignment:update", payload);
            return;
        }

        const workerEmitter = await getEmitter();
        workerEmitter.to(assignmentId).emit("assignment:update", payload);
    } catch (error) {
        console.error("[Socket] Failed to emit update:", error);
    }
}
