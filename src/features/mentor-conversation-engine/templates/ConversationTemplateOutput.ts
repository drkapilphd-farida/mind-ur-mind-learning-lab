export type ConversationTemplateOutput = {
  title: string
  mainResponse: string
  suggestedActions: readonly string[]
  followUpQuestion: string | null
}
