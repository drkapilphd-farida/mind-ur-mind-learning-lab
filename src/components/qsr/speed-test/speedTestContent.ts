// Reading Speed Test™ content types + persona copy. The actual passage
// pool lives in speedTestPassagePool.ts (24 real passages drawn from the
// product's own passageLibrary.ts, each with 2 authored comprehension
// questions) — a real random pair is picked per session rather than
// reusing the same fixed calibration/demo passage every time.

export type SpeedTestQuestion = {
  question: string;
  options: readonly string[];
  correctIndex: number;
};

export type SpeedTestPassage = {
  text: string;
  questions: readonly [SpeedTestQuestion, SpeedTestQuestion];
};

export type SpeedTestPersonaId = "exam" | "pro" | "parent";

export type SpeedTestPersona = {
  id: SpeedTestPersonaId;
  label: string;
};

export const SPEED_TEST_PERSONAS: readonly SpeedTestPersona[] = [
  { id: "exam", label: "Exam aspirant" },
  { id: "pro", label: "Working professional" },
  { id: "parent", label: "Parent, testing for my child" },
];

export const PERSONA_INSIGHT_COPY: Record<SpeedTestPersonaId | "default", string> = {
  exam: "Aspirants who clear competitive exams typically read 500+ WPM — that's hours of extra revision time over a syllabus.",
  pro: "Professionals who read this fast get through a full inbox and report stack in the time it takes most people to clear half of it.",
  parent: "Kids who train this skill spend less time stuck on a chapter — and more time actually finishing what they start.",
  default: "Trained readers typically operate at 500+ WPM, more than double the average.",
};
