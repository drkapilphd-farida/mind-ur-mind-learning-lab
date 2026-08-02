import type { ConversationContext, ConversationType } from '../types'
import type { ConversationTemplateOutput } from './ConversationTemplateOutput'

// The "reusable conversation templates" the Sprint 10 brief asks for —
// one deterministic function per ConversationType. Every template only
// ever references fields ConversationContext actually has; a `null`
// field always degrades to an honest, generic line — never a
// fabricated specific ("No hallucinated learner data").
export const CONVERSATION_TEMPLATES: Record<ConversationType, (context: ConversationContext) => ConversationTemplateOutput> = {
  welcome: (context) => ({
    title: `Welcome, ${context.learnerName}!`,
    mainResponse:
      context.focusSkill !== null
        ? `Hi ${context.learnerName}, I'm your learning mentor. I'll help you build steady, evidence-based progress on ${context.focusSkill}.`
        : `Hi ${context.learnerName}, I'm your learning mentor. I'm here to help you build steady, evidence-based progress toward your goals.`,
    suggestedActions: ['Explore your first exercise', 'Tell me about your learning goal'],
    followUpQuestion: 'What would you like to focus on first?',
  }),

  'daily-motivation': (context) => ({
    title: 'Keep Going!',
    mainResponse:
      context.streak !== null
        ? `You're on a ${context.streak}-day streak, ${context.learnerName} — that consistency is what builds real skill.`
        : `Every session adds up, ${context.learnerName}. Let's keep the momentum going.`,
    suggestedActions: ["Start today's session"],
    followUpQuestion: 'Ready to begin?',
  }),

  'learning-plan-explanation': (context) => ({
    title: 'Your Learning Plan',
    mainResponse:
      (context.focusSkill !== null ? `Your current plan focuses on ${context.focusSkill}, based on where you are right now.` : 'Your learning plan is tailored to your current progress.') +
      (context.recommendedExercise !== null ? ` We'll start with ${context.recommendedExercise}.` : ''),
    suggestedActions: ["Review today's exercises"],
    followUpQuestion: 'Would you like me to walk through why this plan fits you?',
  }),

  'exercise-recommendation': (context) => ({
    title: 'Recommended For You',
    mainResponse:
      context.recommendedExercise !== null
        ? `Based on your current progress, I'd recommend "${context.recommendedExercise}" next.`
        : "I don't have a specific exercise to recommend yet — let's check your current plan.",
    suggestedActions: context.recommendedExercise !== null ? [`Start ${context.recommendedExercise}`] : [],
    followUpQuestion: 'Want to start now?',
  }),

  'study-reminder': (context) => ({
    title: 'Time to Practice',
    mainResponse: `A quick reminder, ${context.learnerName} — a short session today keeps your progress steady.`,
    suggestedActions: ['Start a quick session'],
    followUpQuestion: 'Do you have a few minutes now?',
  }),

  'progress-celebration': (context) => ({
    title: 'Great Progress!',
    mainResponse:
      context.progressPercent !== null
        ? `You've reached ${context.progressPercent}% progress, ${context.learnerName} — that's real, earned progress.`
        : `You're making steady progress, ${context.learnerName}.`,
    suggestedActions: ['See your milestones'],
    followUpQuestion: null,
  }),

  'weakness-coaching': (context) => ({
    title: "Let's Strengthen This Together",
    mainResponse:
      context.focusSkill !== null
        ? `I've noticed ${context.focusSkill} is an area we can build up together. This is completely normal — let's work on it step by step.`
        : "Let's work together on the areas that need the most attention.",
    suggestedActions: context.recommendedExercise !== null ? [`Try ${context.recommendedExercise}`] : [],
    followUpQuestion: 'Would you like a few tips to get started?',
  }),

  'milestone-conversation': (context) => ({
    title: 'Milestone Update',
    mainResponse: context.currentMilestone !== null ? `You're working toward: ${context.currentMilestone}.` : "Let's check in on your next milestone.",
    suggestedActions: ['View your milestones'],
    followUpQuestion: null,
  }),

  'journey-guidance': (context) => ({
    title: 'Your Journey Ahead',
    mainResponse:
      context.focusSkill !== null
        ? `Your journey is centered on ${context.focusSkill} right now.` + (context.currentMilestone !== null ? ` The next stop is: ${context.currentMilestone}.` : '')
        : "Let's map out where your journey goes next.",
    suggestedActions: ['See your full journey'],
    followUpQuestion: 'Want to know what comes after this?',
  }),

  'next-session-suggestion': (context) => ({
    title: "What's Next",
    mainResponse:
      context.recommendedExercise !== null
        ? `For your next session, I'd suggest "${context.recommendedExercise}".`
        : "Let's decide together what your next session should focus on.",
    suggestedActions: context.recommendedExercise !== null ? [`Schedule ${context.recommendedExercise}`] : [],
    followUpQuestion: 'Does that work for you?',
  }),
}
