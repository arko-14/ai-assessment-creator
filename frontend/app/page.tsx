import Link from "next/link";
import { getAssignments } from "@/lib/api";

export default async function Home() {
    const assignments = await getAssignments().catch(() => []);

    return (
        <main className="min-h-screen p-6 md:p-20 flex flex-col items-center">
            <div className="w-full max-w-4xl space-y-10">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-bold tracking-tight">Assignments</h1>
                    <Link href="/assignment/create" className="figma-pill-button">
                        Create Assignment
                    </Link>
                </div>

                {assignments.length === 0 ? (
                    <div className="figma-card flex flex-col items-center justify-center min-h-[400px] text-center">
                        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900">Created Assignments will appear here</h2>
                        <p className="mt-2 text-gray-500 max-w-sm">
                            Click the button above to start generating your first AI-powered assessment paper.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {assignments.map((a: any) => (
                            <Link
                                key={a._id}
                                href={`/assignment/${a._id}`}
                                className="figma-card !p-6 flex items-center justify-between hover:border-gray-400 transition-colors"
                            >
                                <div>
                                    <h3 className="font-bold text-lg">Assignment {a._id.slice(-6)}</h3>
                                    <p className="text-sm text-gray-500">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${a.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {a.status}
                                    </span>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}