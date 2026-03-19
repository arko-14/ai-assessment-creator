import { create } from "zustand";

export type QuestionTypeConfig = {
    count: number;
    marks: number;
};

type AssignmentFormState = {
    dueDate: string;
    configs: Record<string, QuestionTypeConfig>;
    additionalInstructions: string;
    sourceText: string;

    // Actions
    setField: (key: any, value: any) => void;
    toggleType: (type: string) => void;
    updateConfig: (type: string, key: keyof QuestionTypeConfig, value: number) => void;
    reset: () => void;

    // Getters
    getTotalQuestions: () => number;
    getTotalMarks: () => number;
};

const DEFAULT_TYPES = ["MCQ", "Short Answer", "Long Answer", "Fill in the Blanks"];

export const useAssignmentStore = create<AssignmentFormState>((set, get) => ({
    dueDate: "",
    configs: {
        "MCQ": { count: 5, marks: 1 }
    },
    additionalInstructions: "",
    sourceText: "",

    setField: (key, value) => set((state) => ({ ...state, [key]: value })),

    toggleType: (type) => set((state) => {
        const newConfigs = { ...state.configs };
        if (newConfigs[type]) {
            delete newConfigs[type];
        } else {
            newConfigs[type] = { count: 5, marks: 2 };
        }
        return { configs: newConfigs };
    }),

    updateConfig: (type, key, value) => set((state) => ({
        configs: {
            ...state.configs,
            [type]: {
                ...state.configs[type],
                [key]: Math.max(1, value)
            }
        }
    })),

    getTotalQuestions: () => {
        return Object.values(get().configs).reduce((acc, curr) => acc + curr.count, 0);
    },

    getTotalMarks: () => {
        return Object.values(get().configs).reduce((acc, curr) => acc + (curr.count * curr.marks), 0);
    },

    reset: () => set({
        dueDate: "",
        configs: { "MCQ": { count: 5, marks: 1 } },
        additionalInstructions: "",
        sourceText: "",
    }),
}));