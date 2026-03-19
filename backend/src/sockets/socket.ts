import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Emitter } from "@socket.io/redis-emitter";
import { createClient } from "redis";
import { env } from "../config/env";

let io: Server;
let emitter: Emitter;

export async function initSocket(server: HttpServer) {
    const pubClient = createClient({ url: env.redisUrl });
    const subClient = pubClient.duplicate();

    pubClient.on("error", (err) => console.error("[Redis Pub] Error:", err));
    subClient.on("error", (err) => console.error("[Redis Sub] Error:", err));

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io = new Server(server, {
        cors: {
            origin: env.frontendUrl,
            methods: ["GET", "POST"],
        },
    });

    io.adapter(createAdapter(pubClient, subClient));

    io.on("connection", (socket) => {
        socket.on("assignment:join", (assignmentId: string) => {
            socket.join(assignmentId);
        });
    });

    return io;
}

export async function getEmitter() {
    if (emitter) return emitter;
    const redisClient = createClient({ url: env.redisUrl });
    redisClient.on("error", (err) => console.error("[Redis Emitter] Error:", err));
    await redisClient.connect();
    emitter = new Emitter(redisClient);
    return emitter;
}

export async function emitAssignmentUpdate(
    assignmentId: string,
    payload: Record<string, unknown>
) {
    // If we have the full IO instance (API server process)
    if (io) {
        io.to(assignmentId).emit("assignment:update", payload);
        return;
    }

    // Otherwise use the emitter (Worker process)
    const workerEmitter = await getEmitter();
    workerEmitter.to(assignmentId).emit("assignment:update", payload);
}
