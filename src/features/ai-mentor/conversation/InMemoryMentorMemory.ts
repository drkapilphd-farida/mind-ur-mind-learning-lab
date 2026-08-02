import type { MentorMemory } from '../contracts'

// Implements MentorMemory. Fully in-memory, per this chunk's database-
// independence rule. Facts are appended, never deduplicated or
// summarized here — that's real intelligence a future implementation
// would add, not something to fake with mock logic.
export class InMemoryMentorMemory implements MentorMemory {
  private readonly facts = new Map<string, string[]>()

  async remember(learningProjectId: string, fact: string): Promise<void> {
    const existing = this.facts.get(learningProjectId) ?? []
    this.facts.set(learningProjectId, [...existing, fact])
  }

  async recall(learningProjectId: string): Promise<readonly string[]> {
    return this.facts.get(learningProjectId) ?? []
  }
}

export function createMentorMemory(): MentorMemory {
  return new InMemoryMentorMemory()
}
