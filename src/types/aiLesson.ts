export type ReadingLevel = "emerging" | "on-grade" | "advanced";
export type Language = "en" | "es" | "fr" | "de" | "zh";

export interface AILesson {
  meta: {
    subject: string;
    topic: string;
    gradeLevel: string;        // e.g., "6", "8-9"
    readingLevel: ReadingLevel;
    language: Language;
    durationMinutes: number;   // total time target
    standards?: { framework: string; code: string; description?: string }[];
  };
  objectives: string[];
  vocabulary?: string[];
  materials: string[];
  warmup: { minutes: number; steps: string[] };
  directInstruction: { minutes: number; steps: string[] };
  guidedPractice: { minutes: number; activities: string[] };
  independentPractice: { minutes: number; choices: string[] };
  differentiation: {
    struggling: string[];
    onLevel: string[];
    advanced: string[];
    englishLearners?: string[];
    iep?: string[];
  };
  formativeAssessment: { methods: string[]; exitTicket?: string };
  summativeAssessment?: { prompt?: string; rubric?: string[] };
  teacherNotes?: string[];
  safetyAndAIUse?: string[];
}
