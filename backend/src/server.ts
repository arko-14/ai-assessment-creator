import { createServer } from "http";
import { app } from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { initSocket } from "./sockets/socket";

async function bootstrap() {
    await connectDB();
    const server = createServer(app);
    await initSocket(server);


    server.listen(env.port, () => {
        console.log(`API running on http://localhost:${env.port}`);
    });
}

bootstrap().catch((error) => {
    console.error(error);
    process.exit(1);
});