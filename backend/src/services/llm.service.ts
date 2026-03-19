import Groq from "groq-sdk";
import { env } from "../config/env";

const groq = new Groq({ apiKey: env.groqApiKey });

const MODEL_CHAIN = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile"
];

export async function generateQuestionsFromLLM(prompt: string) {
    let lastError: any = null;

    for (const model of MODEL_CHAIN) {
        try {
            console.log(`[LLM] Attempting generation with model: ${model}`);
            const startTime = performance.now();

            const response = await groq.chat.completions.create({
                model: model,
                temperature: 0.4,
                messages: [
                    {
                        role: "system",
                        content: "You generate strictly valid JSON for exam papers. No markdown, no commentary.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            });

            const endTime = performance.now();
            console.log(`[LLM] Success with ${model} (Time: ${((endTime - startTime) / 1000).toFixed(2)}s)`);
            return response.choices[0]?.message?.content || "";

        } catch (error) {
            console.warn(`[LLM] Model ${model} failed. Error: ${error instanceof Error ? error.message : "Unknown"}`);
            lastError = error;
            // Continue to next model in chain
        }
    }

    console.error("[LLM] All models in the chain failed.");
    throw lastError || new Error("Failed to generate assessment with any available model.");
}