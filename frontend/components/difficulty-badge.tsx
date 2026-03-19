import { Difficulty } from "@/types/assignment";

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
    return (
        <span className="rounded-full border px-2 py-1 text-xs font-medium uppercase tracking-wide">
            {difficulty}
        </span>
    );
}