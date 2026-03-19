import { z } from "zod";

const difficultyEnum = z.enum(["easy", "medium", "hard"]);

const questionSchema = z.object({
    text: z.string().min(1),
    difficulty: difficultyEnum,
    marks: z.number().int().positive(),
});

const sectionSchema = z.object({
    title: z.string().min(1),
    instruction: z.string().min(1),
    questions: z.array(questionSchema).min(1),
});

const outputSchema = z.object({
    sections: z.array(sectionSchema).min(1),
});

function extractJson(raw: string) {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON found in LLM output");
    return raw.slice(start, end + 1);
}

export function parseAndValidateOutput(raw: string) {
    const jsonString = extractJson(raw);
    const parsed = JSON.parse(jsonString);
    return outputSchema.parse(parsed);
}