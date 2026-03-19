export type Difficulty = "easy" | "medium" | "hard";

export type Question = {
    text: string;
    difficulty: Difficulty;
    marks: number;
};

export type Section = {
    title: string;
    instruction: string;
    questions: Question[];
};

export type Assignment = {
    _id: string;
    dueDate: string;
    questionTypes: string[];
    totalQuestions: number;
    totalMarks: number;
    additionalInstructions?: string;
    sourceText?: string;
    status: "queued" | "processing" | "completed" | "failed";
    result?: {
        sections: Section[];
    };
    error?: string;
};