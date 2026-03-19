"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAssignmentStore } from "@/store/assignment-store";
import { createAssignment } from "@/lib/api";

const QUESTION_TYPES = ["MCQ", "Short Answer", "Long Answer", "Fill in the Blanks"];

export function AssignmentForm() {
    const store = useAssignmentStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setIsProcessing(true);
        setError("");

        try {
            if (file.type === "text/plain") {
                const text = await file.text();
                store.setField("sourceText", text);
            } else if (file.type === "application/pdf") {
                const pdfjsLib = (window as any).pdfjsLib;
                if (!pdfjsLib) {
                    setError("PDF library not loaded yet.");
                    setIsProcessing(false);
                    return;
                }
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const pageText = content.items.map((item: any) => item.str).join(" ");
                    fullText += pageText + "\n";
                }
                store.setField("sourceText", fullText);
            }
        } catch (err) {
            setError("Failed to extract text from file.");
            setFileName("");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const types = Object.keys(store.configs);
        if (types.length === 0) {
            setError("Please select at least one question type");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const res = await createAssignment({
                dueDate: store.dueDate,
                questionTypes: types,
                configs: store.configs,
                totalQuestions: store.getTotalQuestions(),
                totalMarks: store.getTotalMarks(),
                additionalInstructions: store.additionalInstructions,
                sourceText: store.sourceText,
            });
            store.reset();
            router.push(`/assignment/${res._id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl pb-32">
            <div className="figma-card">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Assignment Details</h1>
                    <p className="text-gray-500 mt-1">Basic information about your assignment</p>
                </div>

                <div className="space-y-8">
                    {/* File Upload Zone */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`group flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-[32px] cursor-pointer transition-all ${fileName ? "border-green-500 bg-green-50" : "border-gray-200 hover:bg-gray-50"
                            }`}
                    >
                        <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${fileName ? "bg-green-100" : "bg-gray-50"
                            }`}>
                            {isProcessing ? (
                                <div className="h-6 w-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            ) : fileName ? (
                                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {isProcessing ? "Processing File..." : fileName ? fileName : "Choose a file or drag & drop it here"}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            {fileName ? `${store.sourceText.length} characters extracted` : "PDF, TXT, upto 10MB"}
                        </p>
                        <button type="button" className={`mt-6 px-6 py-2 border rounded-full text-sm font-semibold shadow-sm transition-all ${fileName ? "bg-green-600 text-white border-green-600" : "bg-gray-50"
                            }`}>
                            {fileName ? "Change File" : "Browse Files"}
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900">Source Material</label>
                        <textarea
                            rows={6}
                            className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="File content will appear here after upload, or you can paste text directly..."
                            value={store.sourceText}
                            onChange={(e) => store.setField("sourceText", e.target.value)}
                        />
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider pl-1">
                            {store.sourceText.length > 0 ? `${store.sourceText.length} characters of context provided` : "No source text provided yet"}
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900">Due Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    required
                                    className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    value={store.dueDate}
                                    onChange={(e) => store.setField("dueDate", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900 text-transparent">.</label>
                            <div className="flex gap-2">
                                {QUESTION_TYPES.map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => store.toggleType(type)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${store.configs[type] ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-200"
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="hidden md:grid grid-cols-3 gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
                            <div className="col-span-1">Question Type</div>
                            <div className="text-center">No. of Questions</div>
                            <div className="text-center">Marks</div>
                        </div>

                        {Object.entries(store.configs).map(([type, config]) => (
                            <div key={type} className="flex flex-col md:grid md:grid-cols-3 items-center gap-4 py-4 md:py-2 border-b border-gray-50">
                                <div className="flex items-center justify-between w-full md:w-auto gap-3">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => store.toggleType(type)} className="text-gray-300 hover:text-red-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        <span className="font-bold text-gray-900 text-lg md:text-base">{type}</span>
                                    </div>
                                    <div className="md:hidden flex gap-4">
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Qty</p>
                                            <p className="font-bold">{config.count}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Marks</p>
                                            <p className="font-bold">{config.marks}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between md:justify-center w-full md:w-auto items-center">
                                    <span className="md:hidden text-xs font-bold text-gray-400 uppercase">Questions</span>
                                    <div className="figma-input-pill scale-90 md:scale-100">
                                        <button type="button" onClick={() => store.updateConfig(type, 'count', config.count - 1)} className="figma-control-btn">
                                            -
                                        </button>
                                        <span className="w-8 text-center font-bold text-sm">{config.count}</span>
                                        <button type="button" onClick={() => store.updateConfig(type, 'count', config.count + 1)} className="figma-control-btn">
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between md:justify-center w-full md:w-auto items-center">
                                    <span className="md:hidden text-xs font-bold text-gray-400 uppercase">Marks each</span>
                                    <div className="figma-input-pill scale-90 md:scale-100">
                                        <button type="button" onClick={() => store.updateConfig(type, 'marks', config.marks - 1)} className="figma-control-btn">
                                            -
                                        </button>
                                        <span className="w-8 text-center font-bold text-sm">{config.marks}</span>
                                        <button type="button" onClick={() => store.updateConfig(type, 'marks', config.marks + 1)} className="figma-control-btn">
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900">Optional Instructions</label>
                        <textarea
                            rows={4}
                            className="w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Add specific instructions for the AI..."
                            value={store.additionalInstructions}
                            onChange={(e) => store.setField("additionalInstructions", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Sticky Footer Summary */}
            <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 md:px-6">
                <div className="bg-white rounded-3xl md:rounded-full border shadow-2xl p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                    <div className="flex gap-8 md:pl-6">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Questions</p>
                            <p className="text-lg md:text-xl font-black text-gray-900">{store.getTotalQuestions()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Marks</p>
                            <p className="text-lg md:text-xl font-black text-gray-900">{store.getTotalMarks()}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto pr-0 md:pr-2">
                        {error && <p className="hidden md:block text-xs font-bold text-red-500 max-w-[150px] line-clamp-1">{error}</p>}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="figma-pill-button flex items-center justify-center gap-2 w-full md:w-auto md:pr-4 h-[48px] md:h-[52px]"
                        >
                            {loading ? "Generating..." : "Generate Assessment"}
                            {!loading && (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
