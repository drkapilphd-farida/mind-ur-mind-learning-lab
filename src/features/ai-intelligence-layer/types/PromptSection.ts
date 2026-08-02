// One labeled section of the final prompt — the Prompt Composition
// Engine produces one per context engine's output (User, Journey,
// Mind, Conversation), each independently inspectable/testable rather
// than pre-flattened into one opaque string.
export type PromptSection = {
  title: string
  content: string
}
