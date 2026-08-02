import type { AIFoundationPayload } from '@/core/ai-foundation'

const SYSTEM_INSTRUCTION = `You are an expert learning-strategy advisor analyzing one core concept from real learning material.
Return ONLY a single, valid JSON object — no prose before or after it, no markdown code fences — with exactly this shape:

{
  "readingStrategyNotes": "string — one or two sentences of concrete reading advice for this concept",
  "revisionStrategyNotes": "string — one or two sentences of concrete revision advice for this concept",
  "practiceStrategyNotes": "string — one or two sentences of concrete practice advice for this concept",
  "confidence": number between 0 and 1
}

Ground every recommendation in the real content provided below — never invent details about the concept that aren't supported by it. "confidence" is your own honest self-assessment of how reliable this guidance is given the content available.`

// AI Learning Analysis Engine™ (UCE-5). Pure. The one AI-derived output
// this sprint — reuses AIFoundation's own 'difficulty-analysis' task
// (declared in AIF-1, never consumed by any engine until now). Called
// only for real 'core' concepts (see buildLearningAnalysis.ts), never
// per chunk and never per concept pair, to keep cost bounded.
export function buildStrategyPrompt(conceptLabel: string, supportingChunkContents: readonly string[]): AIFoundationPayload {
  const contextLines = [`Core concept: ${conceptLabel}`, '', 'Real content covering this concept:', ...supportingChunkContents.map((content, index) => `[${index + 1}] ${content}`)]

  return {
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: contextLines.join('\n') },
    ],
  }
}
