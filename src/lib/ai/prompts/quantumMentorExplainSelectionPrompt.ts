import type { SelectionActionType } from '@/features/quantum-mentor/types'
import { getLanguageName, type SupportedLanguage } from '@/features/quantum-document-transformer/supportedLanguages'

// One instruction per quick action — each targets the *selection*
// specifically, using `context` only as grounding, never as something to
// explain in its own right. Kept short and prose-only (no markdown/lists)
// since the response renders as plain text in the AI Mentor drawer.
const ACTION_INSTRUCTIONS: Record<Exclude<SelectionActionType, 'translate_explain'>, string> = {
  explain_simply:
    'Explain the highlighted text in the simplest possible terms, as if to a curious beginner encountering this idea for the first time. 2-4 short sentences, plain prose, no jargon.',
  real_world_examples:
    'Give one or two concrete, real-world examples or analogies that illustrate specifically what the highlighted text is describing. 2-4 short sentences, plain prose.',
  simplify:
    'Rewrite the highlighted text in simpler, plainer language, preserving its full meaning. Keep it roughly the same length as the original.',
}

// Regional Language Support — `translate_explain`'s own instruction is
// built per-request (not a static string) since it names the target
// language by hand: writing "respond in Hindi" only works if the model is
// actually told which language, and this is the one action where that
// varies per call.
function buildTranslateExplainInstruction(targetLanguage: SupportedLanguage): string {
  const languageName = getLanguageName(targetLanguage)
  return `Translate the highlighted text into ${languageName}, and explain it the way a fluent native ${languageName} speaker would explain it to a student — natively, not as a stilted literal translation. Write your ENTIRE response in ${languageName} (do not respond in English). Include one or two simple, everyday examples grounded in that language's own cultural/regional context to make the idea concrete. 3-5 short sentences, plain prose, no jargon, no markdown.`
}

export function buildQuantumMentorExplainSelectionPrompt(
  selectedText: string,
  surroundingContext: string | undefined,
  actionType: SelectionActionType,
  targetLanguage: SupportedLanguage | undefined,
): string {
  const contextBlock = surroundingContext ? `\n\n<surrounding_context>\n${surroundingContext}\n</surrounding_context>` : ''
  const instruction = actionType === 'translate_explain' ? buildTranslateExplainInstruction(targetLanguage ?? 'hi') : ACTION_INSTRUCTIONS[actionType]

  return `You are an intuitive, encouraging learning mentor helping a student who just highlighted a piece of text while studying a document.

<highlighted_text>
${selectedText}
</highlighted_text>${contextBlock}

${instruction}

Respond with only the explanation itself — no preamble like "Sure!" or "Here's an explanation", no headings, no markdown formatting.`
}
