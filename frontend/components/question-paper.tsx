import { Assignment, Section, Question } from "@/types/assignment";

export function QuestionPaper({ assignment }: { assignment: Assignment }) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getDifficultyLabel = (diff: string) => {
        return `[${diff.charAt(0).toUpperCase() + diff.slice(1)}]`;
    };

    return (
        <div className="mx-auto max-w-4xl bg-white p-6 md:p-12 figma-card !rounded-none shadow-sm md:shadow-none border border-gray-100 md:border-none print:p-0 print:shadow-none print:border-none">
            {/* Academic Header */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 border-b-2 border-gray-900 pb-6 md:pb-8 mb-6 md:mb-8 text-center md:text-left">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-2 border-gray-900 flex items-center justify-center bg-gray-50 flex-shrink-0">
                    <div className="h-8 w-8 md:h-10 md:w-10 border-2 border-gray-900 rotate-45 flex items-center justify-center">
                        <div className="h-3 w-3 md:h-4 md:w-4 bg-gray-900 -rotate-45"></div>
                    </div>
                </div>
                <div className="flex-1">
                    <h1 className="text-xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Delhi Public School</h1>
                    <p className="text-sm md:text-lg font-bold text-gray-700">Bokaro Steel City, Jharkhand</p>
                </div>
                <div className="text-center md:text-right mt-2 md:mt-0">
                    <p className="text-xs md:text-sm font-black uppercase">Term Assessment</p>
                    <p className="text-xs font-bold text-gray-500">{formatDate(assignment.dueDate)}</p>
                </div>
            </div>

            {/* Student Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-12 text-sm font-bold uppercase tracking-wider">
                <div className="flex items-end gap-2">
                    <span className="flex-shrink-0">Student Name:</span>
                    <div className="flex-1 border-b border-gray-400 h-5"></div>
                </div>
                <div className="flex items-end gap-2 pr-0 md:pl-4">
                    <span className="flex-shrink-0">Subject:</span>
                    <div className="flex-1 font-black text-gray-900">General Science</div>
                </div>
                <div className="flex items-end gap-2">
                    <span className="flex-shrink-0">Roll Number:</span>
                    <div className="flex-1 border-b border-gray-400 h-5"></div>
                </div>
                <div className="flex items-end gap-2 pr-0 md:pl-4">
                    <span className="flex-shrink-0">Class / Section:</span>
                    <div className="flex-1 border-b border-gray-400 h-5"></div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-10 py-3 border-y border-gray-100 italic text-sm text-gray-500">
                <p>Time Allowed: 45 Minutes</p>
                <p>Maximum Marks: {assignment.totalMarks}</p>
            </div>

            <div className="space-y-12">
                {assignment.result?.sections.map((section: Section, idx: number) => (
                    <section key={idx} className="space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-gray-900 underline decoration-2 underline-offset-8">
                                {section.title}
                            </h2>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest pt-2">
                                {section.instruction}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {section.questions.map((question: Question, qIdx: number) => (
                                <div key={qIdx} className="flex items-start gap-4">
                                    <span className="font-black text-gray-900 min-w-[24px]">{qIdx + 1}.</span>
                                    <div className="flex-1">
                                        <p className="text-base font-medium text-gray-800 leading-relaxed">
                                            <span className="font-bold text-gray-400 mr-2">
                                                {getDifficultyLabel(question.difficulty)}
                                            </span>
                                            {question.text}
                                        </p>
                                    </div>
                                    <span className="font-black text-gray-400 text-sm whitespace-nowrap">
                                        [{question.marks} Marks]
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* Answer Key Placeholder Footer */}
            <div className="mt-20 pt-10 border-t border-dashed border-gray-200 text-center">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">End of Question Paper</p>
            </div>
        </div>
    );
}
