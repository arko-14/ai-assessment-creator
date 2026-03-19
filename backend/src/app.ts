import express from "express";
import cors from "cors";
import morgan from "morgan";
import assignmentRoutes from "./routes/assignment.routes";
import { env } from "./config/env";

export const app = express();

app.use(morgan("dev"));
app.use(
    cors({
        origin: env.frontendUrl,
    })
);

app.use(express.json({ limit: "2mb" }));

app.get("/health", (_, res) => {
    res.json({ ok: true });
});

app.use("/api", assignmentRoutes);