export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type ChatResult =
  | { success: true; response: string }
  | { success: false; error: string }
