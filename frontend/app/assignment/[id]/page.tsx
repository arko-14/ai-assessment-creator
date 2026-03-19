"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAssignment, regenerateAssignment } from "@/lib/api";
import { socket } from "@/lib/socket";
import { Assignment } from "@/types/assignment";
import { StatusChip } from "@/components/status-chip";
import { QuestionPaper } from "@/components/question-paper";

export default function AssignmentPage() {
    const params = useParams();
    const id = params.id as string;
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        let mounted = true;

        const fetchAssignment = async () => {
            try {
                const data = await getAssignment(id);
                if (mounted) {
                    setAssignment(data);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch assignment:", error);
                if (mounted) setLoading(false);
            }
        };

        fetchAssignment();

        socket.connect();
        socket.emit("assignment:join", id);

        socket.on("assignment:update", (payload: any) => {
            if (payload.assignmentId === id) {
                setAssignment((prev) => (prev ? { ...prev, ...payload } : prev));
            }
        });

        return () => {
            mounted = false;
            socket.off("assignment:update");
            socket.disconnect();
        };
    }, [id]);

    const onRegenerate = async () => {
        if (!id) return;
        try {
            await regenerateAssignment(id);
            setAssignment((prev) => (prev ? { ...prev, status: "queued" } : prev));
        } catch (error) {
            console.error("Failed to regenerate:", error);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
                <div className="text-center animate-pulse">
                    <div className="h-8 w-32 bg-gray-200 rounded mx-auto mb-4"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
                </div>
            </main>
        );
    }

    if (!assignment) {
        return (
            <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Assignment Not Found</h1>
                    <p className="mt-2 text-gray-600">The requested assessment could not be located.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-6 md:p-10 bg-gray-50">
            <div className="mx-auto mb-8 flex max-w-4xl items-center justify-between no-print">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assessment Overview</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        View and manage your generated question paper.
                    </p>
                </div>
                <div className="flex items-center gap-4 no-print">
                    <button
                        onClick={() => window.print()}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                    </button>
                    <button
                        onClick={onRegenerate}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        Regenerate
                    </button>
                </div>
            </div>

            {assignment.status === "completed" && assignment.result ? (
                <QuestionPaper assignment={assignment} />
            ) : assignment.status === "failed" ? (
                <div className="mx-auto max-w-4xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Generation Failed</h2>
                    <p className="mt-2 text-red-600 font-medium">{assignment.error}</p>
                    <button
                        onClick={onRegenerate}
                        className="mt-6 inline-flex rounded-xl bg-black px-6 py-2.5 text-sm font-bold text-white hover:opacity-90"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <div className="mx-auto max-w-4xl rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/5 mb-6">
                        <svg className="h-8 w-8 text-black animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Generating Your Assessment</h2>
                    <p className="mt-3 text-gray-500 max-w-md mx-auto">
                        Our AI is currently crafting a structured question paper based on your requirements. This usually takes 10-30 seconds.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-black animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 rounded-full bg-black animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 rounded-full bg-black animate-bounce"></span>
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                        Status: {assignment.status}
                    </p>
                </div>
            )}
        </main>
    );
}
