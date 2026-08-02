import type { AIFoundationPayload } from '@/core/ai-foundation'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'

const SYSTEM_INSTRUCTION = `You are an expert instructional designer preparing study material for real learners.
Read the chapter content and its already-identified core concepts, then return ONLY a single, valid JSON object — no prose before or after it, no markdown code fences — with exactly this shape:

{
  "conceptExplanations": [{"concept": string, "explanation": string}],
  "memoryHooks": string[],
  "associations": string[],
  "simpleMemoryNotes": string[],
  "recallQuestions": [{"question": string, "expectedAnswerHint": string}],
  "applicationQuestions": [{"scenario": string, "question": string}],
  "aiMentorContext": {
    "beginnerExplanation": string,
    "simpleExplanation": string,
    "realLifeExample": string,
    "commonDoubts": string[]
  }
}

Every field must be grounded in the real content given to you — never invent facts, examples, or terms not
actually present in or directly implied by the text. "conceptExplanations" must cover every concept listed
below, in plain language a beginner could follow. "memoryHooks"/"associations"/"simpleMemoryNotes" are short,
concrete mnemonic aids for this specific content, never generic study advice. "recallQuestions" test whether
a learner remembers a real fact from the text; "applicationQuestions" ask the learner to apply a real concept
to a short, realistic scenario. "commonDoubts" are real, specific confusions learners genuinely have about
this exact content, not generic uncertainty. If a category genuinely has nothing real to add for this
content, return an empty array rather than fabricating an entry.`

// Reading Intelligence Engine™ Upgrade — Sprint-1: Learning Blueprint
// Generator™. Pure — builds the ONE new prompt this sprint introduces,
// requesting every genuinely-new Blueprint field (Memory Assets, AI
// Mentor Context, recall/application questions, per-concept
// explanations) in a single structured JSON response, matching UCE-3B's
// own "one combined request, not several" precedent exactly.
export function buildBlueprintGenerationPrompt(chunk: LearningChunk, document: UniversalLearningDocument, coreConceptLabels: readonly string[]): AIFoundationPayload {
  const contextLines = [
    `Document: ${document.title}`,
    chunk.location.sectionHeading ? `Section: ${chunk.location.sectionHeading}` : null,
    coreConceptLabels.length > 0 ? `Core concepts already identified in this chapter: ${coreConceptLabels.join(', ')}` : null,
    '',
    'Content:',
    chunk.content,
  ].filter((line): line is string => line !== null)

  return {
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: contextLines.join('\n') },
    ],
  }
}
