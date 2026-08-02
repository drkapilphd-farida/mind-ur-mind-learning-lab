import type { ConversationContext, JourneyContext, MindContext, PromptSection, UserContext } from '../types'

const NONE = 'none'

function orNone(value: string | null): string {
  return value ?? NONE
}

function listOrNone(values: readonly string[]): string {
  return values.length > 0 ? values.join(', ') : NONE
}

// One deterministic string-formatting function per context type — kept
// separate from DefaultPromptCompositionEngine itself so each is
// independently testable and so a future PromptSection format change
// doesn't touch the engine's own composition order/logic.

export function formatUserContextSection(context: UserContext): PromptSection {
  const lines = [
    `Learner: ${context.userProfile.displayName} (${context.ageGroup}, prefers ${context.preferredLanguage}).`,
    `Current journey: ${orNone(context.currentJourney)}. Current lab: ${orNone(context.currentLab)}. Active exercise: ${orNone(context.activeExercise)}.`,
    `Learning goal: ${orNone(context.learningGoal)}. Difficulty level: ${context.difficultyLevel}.`,
  ]
  return { title: 'User Context', content: lines.join('\n') }
}

export function formatJourneyContextSection(context: JourneyContext): PromptSection {
  const lines = [
    `Journey: ${orNone(context.currentJourney)}. Chapter: ${orNone(context.currentChapter)}. Lesson: ${orNone(context.currentLesson)}. Exercise: ${orNone(context.currentExercise)}.`,
    `Completion: ${context.completionPercent}%.`,
    `Previous milestones: ${listOrNone(context.previousMilestones)}.`,
  ]
  return { title: 'Journey Context', content: lines.join('\n') }
}

export function formatMindContextSection(context: MindContext): PromptSection {
  const lines = [
    `Mind Score: ${context.mindScore}. Reading Score: ${context.readingScore}. Memory Score: ${context.memoryScore}. Focus Score: ${context.focusScore}. Visual Intelligence Score: ${context.visualIntelligenceScore}.`,
    `Consistency: ${context.consistency}. XP: ${context.xp}. Streak: ${context.streak}. Current Progress: ${context.currentProgress}.`,
  ]
  return { title: 'Mind Context', content: lines.join('\n') }
}

export function formatConversationContextSection(context: ConversationContext): PromptSection {
  const lines = [
    `Current topic: ${orNone(context.currentTopic)}.`,
    `Previous questions: ${listOrNone(context.previousQuestions)}.`,
    `Conversation summary: ${orNone(context.conversationSummary)}.`,
    `Learning intent: ${orNone(context.learningIntent)}.`,
    `Pending tasks: ${listOrNone(context.pendingTasks)}.`,
  ]
  return { title: 'Conversation Context', content: lines.join('\n') }
}
