import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { Assignment } from "../models/Assignment";
import { generateQuestionsFromLLM } from "../services/llm.service";
import { parseAndValidateOutput } from "../services/parser.service";
import { buildPrompt } from "../services/prompt.service";
import { emitAssignmentUpdate } from "../sockets/socket";
import { connectDB } from "../config/db";

async function startWorker() {
    await connectDB();

    new Worker(
        "assignment-generation",
        async (job) => {
            const { assignmentId } = job.data as { assignmentId: string };
            console.log(`[Worker] Processing target: ${assignmentId}`);

            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) {
                console.error(`[Worker] Assignment ${assignmentId} not found`);
                throw new Error("Assignment not found");
            }

            assignment.status = "processing";
            await assignment.save();
            await emitAssignmentUpdate(assignmentId, {
                assignmentId,
                status: "processing",
            });

            try {
                const startTime = performance.now();
                console.log(`[Worker] Generating questions for ${assignmentId}...`);
                const prompt = buildPrompt({
                    dueDate: assignment.dueDate.toISOString(),
                    questionTypes: assignment.questionTypes,
                    configs: Object.fromEntries(assignment.configs as any),
                    totalQuestions: assignment.totalQuestions,
                    totalMarks: assignment.totalMarks,
                    additionalInstructions: assignment.additionalInstructions,
                    sourceText: assignment.sourceText,
                });

                const llmStartTime = performance.now();
                const raw = await generateQuestionsFromLLM(prompt);
                const llmEndTime = performance.now();
                console.log(`[Worker] LLM call took: ${((llmEndTime - llmStartTime) / 1000).toFixed(2)}s`);

                const result = parseAndValidateOutput(raw);
                const endTime = performance.now();
                console.log(`[Worker] Total processing for ${assignmentId} took: ${((endTime - startTime) / 1000).toFixed(2)}s`);

                assignment.status = "completed";

                assignment.result = result as any;
                assignment.error = "";
                await assignment.save();

                await emitAssignmentUpdate(assignmentId, {
                    assignmentId,
                    status: "completed",
                    result,
                });
            } catch (error) {
                console.error(`[Worker] Error generating for ${assignmentId}:`, error);
                const message = error instanceof Error ? error.message : "Generation failed";
                assignment.status = "failed";
                assignment.error = message;
                await assignment.save();

                await emitAssignmentUpdate(assignmentId, {
                    assignmentId,
                    status: "failed",
                    error: assignment.error,
                });
            }
        },
        { connection: redisConnection as any }
    );


    console.log("Worker started");
}

startWorker().catch((error) => {
    console.error(error);
    process.exit(1);
});
