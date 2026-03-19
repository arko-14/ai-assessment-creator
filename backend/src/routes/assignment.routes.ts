import { Router } from "express";
import { z } from "zod";
import { Assignment } from "../models/Assignment";
import { generationQueue } from "../queues/generation.queue";

const router = Router();

const createAssignmentSchema = z.object({
    dueDate: z.string().min(1),
    questionTypes: z.array(z.string()).min(1),
    configs: z.record(z.object({
        count: z.number().int().positive(),
        marks: z.number().int().positive(),
    })),
    totalQuestions: z.number().int().positive(),
    totalMarks: z.number().int().positive(),
    additionalInstructions: z.string().optional(),
    sourceText: z.string().optional(),
});

router.post("/assignments", async (req, res) => {
    try {
        const data = createAssignmentSchema.parse(req.body);

        const assignment = await Assignment.create({
            ...data,
            status: "queued",
        });

        console.log(`[API] Creating assignment: ${assignment._id}`);

        const job = await generationQueue.add("generate-paper", {
            assignmentId: assignment._id.toString(),
        });

        console.log(`[API] Assignment ${assignment._id} added to queue (Job: ${job.id})`);

        return res.status(201).json({
            _id: assignment._id,
            assignmentId: assignment._id,
            jobId: job.id,
            status: "queued",
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("[API] Validation Error:", error.errors);
            return res.status(400).json({
                error: "Validation failed",
                details: error.errors
            });
        }
        console.error("[API] Error creating assignment:", error);
        return res.status(400).json({
            error: error instanceof Error ? error.message : "Invalid request",
        });
    }
});

router.get("/assignments", async (req, res) => {
    try {
        const assignments = await Assignment.find().sort({ createdAt: -1 });
        return res.json(assignments);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/assignments/:id", async (req, res) => {
    const { id } = req.params;
    if (!id || id === "undefined" || id.length !== 24) {
        return res.status(400).json({ error: "Invalid assignment ID" });
    }

    try {
        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }
        return res.json(assignment);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/assignments/:id/regenerate", async (req, res) => {
    const { id } = req.params;
    if (!id || id === "undefined" || id.length !== 24) {
        return res.status(400).json({ error: "Invalid assignment ID" });
    }

    try {
        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        console.log(`[API] Regenerating assignment: ${id}`);
        assignment.status = "queued";
        assignment.error = "";
        await assignment.save();

        const job = await generationQueue.add("generate-paper", {
            assignmentId: assignment._id.toString(),
        });

        console.log(`[API] Assignment ${id} re-queued (Job: ${job.id})`);

        return res.json({ status: "queued", jobId: job.id });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});


export default router;