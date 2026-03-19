const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function createAssignment(payload: Record<string, unknown>) {
    const res = await fetch(`${API_URL}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create assignment");
    return res.json();
}

export async function getAssignments() {
    const res = await fetch(`${API_URL}/assignments`, {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch assignments");
    return res.json();
}

export async function getAssignment(id: string) {
    const res = await fetch(`${API_URL}/assignments/${id}`, {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch assignment");
    return res.json();
}

export async function regenerateAssignment(id: string) {
    const res = await fetch(`${API_URL}/assignments/${id}/regenerate`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to regenerate assignment");
    return res.json();
}