export function buildPrompt(input: {
  dueDate: string;
  questionTypes: string[];
  configs: Record<string, { count: number; marks: number }>;
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  sourceText?: string;
}) {
  const typeRequirements = Object.entries(input.configs)
    .map(([type, cfg]) => `- ${type}: Generate EXACTLY ${cfg.count} questions. Each question must be worth ${cfg.marks} marks.`)
    .join("\n");

  return `You are a professional assessment creator. 
Generate a high-quality question paper based on the following EXPLICIT requirements.

STUDENT INFO & HEADER:
- School: Delhi Public School, Bokaro Steel City
- Term: Term Assessment
- Date: ${input.dueDate}

EXACT QUESTION REQUIREMENTS:
${typeRequirements}

SUMMARY CONSTRAINTS:
- Total Questions: ${input.totalQuestions} (DO NOT exceed this count)
- Total Marks: ${input.totalMarks} (The sum of all question marks MUST be exactly this)
- Source Material: ${input.sourceText || "General academic knowledge"}
- Additional Instructions: ${input.additionalInstructions || "None"}

OUTPUT RULES:
1. Group questions into logical sections (e.g., Section A for MCQs, Section B for Short Answer).
2. Each question MUST have:
   - "text": The question content.
   - "difficulty": "easy", "medium", or "hard".
   - "marks": The EXACT marks specified for that type in the requirements above.
3. Return ONLY valid JSON in the structure below.
4. No markdown fences, no conversational text.

JSON STRUCTURE:
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "text": "...",
          "difficulty": "easy",
          "marks": 2
        }
      ]
    }
  ]
}`;
}