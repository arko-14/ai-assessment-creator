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