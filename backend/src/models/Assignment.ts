import mongoose, { Schema } from "mongoose";

const QuestionSchema = new Schema(
    {
        text: { type: String, required: true },
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            required: true,
        },
        marks: { type: Number, required: true },
    },
    { _id: false }
);

const SectionSchema = new Schema(
    {
        title: { type: String, required: true },
        instruction: { type: String, required: true },
        questions: { type: [QuestionSchema], default: [] },
    },
    { _id: false }
);

const AssignmentSchema = new Schema(
    {
        dueDate: { type: Date, required: true },
        questionTypes: { type: [String], required: true },
        configs: {
            type: Map,
            of: new Schema({
                count: { type: Number, required: true },
                marks: { type: Number, required: true },
            }, { _id: false })
        },
        totalQuestions: { type: Number, required: true },
        totalMarks: { type: Number, required: true },
        additionalInstructions: { type: String, default: "" },
        sourceText: { type: String, default: "" },
        status: {
            type: String,
            enum: ["queued", "processing", "completed", "failed"],
            default: "queued",
        },
        result: {
            sections: { type: [SectionSchema], default: [] },
        },
        error: { type: String, default: "" },
    },
    { timestamps: true }
);

export const Assignment = mongoose.model("Assignment", AssignmentSchema);