// Prompt template registry, keyed by `PromptTemplate.key`. Empty this
// sprint — no prompts are authored, only the registry shape and lookup
// contract every future template will register into.

import type { PromptTemplate } from '../types'

const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {}

export function registerPromptTemplate(template: PromptTemplate): void {
  PROMPT_TEMPLATES[template.key] = template
}

export function getPromptTemplate(key: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES[key]
}
