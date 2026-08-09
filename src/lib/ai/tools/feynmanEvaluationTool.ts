import type Anthropic from '@anthropic-ai/sdk'

// Interactive Feynman Challenge™ — forces a strict, small JSON shape via
// tool-use (mirrors quantumDocumentIntelligenceTool.ts's own precedent)
// rather than parsing free-form prose: a numeric score needs to be an
// actual number the UI can render as e.g. "4/5", not something regexed
// out of a sentence. Still independently re-validated by
// FeynmanEvaluationResultSchema (generateFeynmanEvaluation.ts) before
// ever reaching the client — this schema only constrains what the model
// *attempts*.
export const FEYNMAN_EVALUATION_TOOL: Anthropic.Tool = {
  name: 'return_feynman_evaluation',
  description: "Return a score and encouraging, constructive feedback for the learner's own explanation of the concept.",
  input_schema: {
    type: 'object',
    properties: {
      score: {
        type: 'integer',
        minimum: 1,
        maximum: 5,
        description: 'How well the explanation captures the concept simply and accurately: 1 (way off or missing the core idea) to 5 (excellent — simple, accurate, and clear).',
      },
      feedback: {
        type: 'string',
        description:
          '2-4 short sentences, warm and encouraging tone: name one specific thing the learner got right, then one specific, actionable thing to add or clarify. Never harsh, never generic ("good job") — ground it in what they actually wrote.',
      },
    },
    required: ['score', 'feedback'],
  },
}
