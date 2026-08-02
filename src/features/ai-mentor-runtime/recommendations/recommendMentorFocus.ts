import type { MentorSessionContext } from '../types/MentorSessionContext'
import type { MentorRecommendation } from '../types/MentorRecommendation'

// AI Mentor™ Sprint-3. Pure, deterministic — real, disclosed thresholds
// over `MentorSessionContext`'s own already-real fields (Sprint-1,
// extended additively this sprint with real `daysSinceLast*Session`
// figures). Never AI-generated text, never a judgment of note/session
// content — the same "recommendation from real structural signals only"
// discipline Memory's and Smart Notes' own insight generation already
// follows. Lifts Sprint-1's own "no recommendations generation yet"
// exclusion, confirmed with the founder as this sprint's real scope.
const INACTIVITY_THRESHOLD_DAYS = 5

export function recommendMentorFocus(context: MentorSessionContext): readonly MentorRecommendation[] {
  const recommendations: MentorRecommendation[] = []

  if (context.readingSessionsCompleted === 0) {
    recommendations.push({ id: 'start-reading', message: "You haven't started a Reading session yet — it's a great place to begin.", priority: 'medium' })
  } else if (context.daysSinceLastReadingSession !== null && context.daysSinceLastReadingSession >= INACTIVITY_THRESHOLD_DAYS) {
    recommendations.push({ id: 'resume-reading', message: `It's been ${context.daysSinceLastReadingSession} days since your last Reading session — consider picking it back up.`, priority: 'medium' })
  }

  if (context.memorySessionsCompleted === 0) {
    recommendations.push({ id: 'start-memory', message: "You haven't started a Memory session yet — it's a real way to build recall over time.", priority: 'medium' })
  } else if (context.daysSinceLastMemorySession !== null && context.daysSinceLastMemorySession >= INACTIVITY_THRESHOLD_DAYS) {
    recommendations.push({ id: 'resume-memory', message: `It's been ${context.daysSinceLastMemorySession} days since your last Memory session — a short session could help.`, priority: 'medium' })
  }

  if (context.smartNotesSessionsCompleted === 0) {
    recommendations.push({ id: 'start-smart-notes', message: 'Smart Notes sessions let you capture your own thinking alongside what you read.', priority: 'low' })
  } else if (context.daysSinceLastSmartNotesSession !== null && context.daysSinceLastSmartNotesSession >= INACTIVITY_THRESHOLD_DAYS) {
    recommendations.push({ id: 'resume-smart-notes', message: `It's been ${context.daysSinceLastSmartNotesSession} days since your last Smart Notes session.`, priority: 'low' })
  }

  if (context.smartNotesSessionsCompleted > 0 && context.documentsWithNotes === 0) {
    recommendations.push({ id: 'add-notes', message: "You've had Smart Notes sessions without saving any notes yet — even a few lines can help things stick.", priority: 'low' })
  }

  return recommendations
}
