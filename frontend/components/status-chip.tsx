export function StatusChip({ status }: { status: string }) {
    const label =
        status === "queued"
            ? "Queued"
            : status === "processing"
                ? "Generating"
                : status === "completed"
                    ? "Completed"
                    : "Failed";

    return (
        <span className="rounded-full border px-3 py-1 text-sm font-medium">
            {label}
        </span>
    );
}