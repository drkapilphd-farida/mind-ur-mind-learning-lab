// Passage Selection™ difficulty/pacing — Sprint 1 of the Quantum Speed
// Reading™ session setup flow. Deliberately NOT imported from
// paragraphDifficulty.ts — every mission/flow in this pack stays an
// independently self-contained feature folder, so a future edit to one
// never silently affects another.
//
// "Adaptive" is a real, named difficulty tier in the product, but has no
// content or pacing yet — kept out of PassageDifficulty entirely (not
// modeled with a fake ms-per-word) so nothing here can accidentally
// fabricate an estimate for it. The UI shows it as a disabled option.

import {
  FlaskConical,
  Landmark,
  Brain,
  User,
  Briefcase,
  Cpu,
  Flame,
  Compass,
  type LucideIcon,
} from 'lucide-react'
import type { PassageCategory } from './passageLibrary'

export type PassageDifficulty = 'easy' | 'medium' | 'hard'

// Reading pace, milliseconds per word — deliberately gentle, general-reading
// paces (not this pack's flashed-recognition SPEED_TIERS), since a passage
// is read continuously, not item-by-item.
export const PASSAGE_MS_PER_WORD: Record<PassageDifficulty, number> = {
  easy: 300,   // → 200 WPM
  medium: 240, // → 250 WPM
  hard: 200,   // → 300 WPM
}

// Display labels only — the underlying PassageDifficulty values
// ('easy'|'medium'|'hard') stay the internal id/URL param, unchanged.
export const PASSAGE_DIFFICULTY_LABEL: Record<PassageDifficulty, string> = {
  easy: 'Beginner',
  medium: 'Intermediate',
  hard: 'Advanced',
}

export const PASSAGE_DIFFICULTY_DESCRIPTION: Record<PassageDifficulty, string> = {
  easy: 'Comfortable pace · Short passages',
  medium: 'Balanced challenge · Medium passages',
  hard: 'Maximum concentration · Longer passages',
}

export const PASSAGE_CATEGORY_LABEL: Record<PassageCategory, string> = {
  science: 'Science',
  history: 'History',
  psychology: 'Psychology',
  biography: 'Biography',
  business: 'Business',
  technology: 'Technology',
  motivation: 'Motivation',
  'general-knowledge': 'General Knowledge',
}

export const PASSAGE_CATEGORY_DESCRIPTION: Record<PassageCategory, string> = {
  science: 'Real-world discoveries and phenomena',
  history: 'Turning points that shaped the world',
  psychology: 'How the mind works and why',
  biography: 'Lives and journeys worth knowing',
  business: 'Strategy, markets, and how work works',
  technology: 'Ideas and tools shaping what comes next',
  motivation: 'Perspective for showing up and following through',
  'general-knowledge': 'Curious, wide-ranging ideas worth knowing',
}

// Presentational only — same Record<category, LucideIcon> convention used
// for READING_MODE_ICON and elsewhere in this app.
export const PASSAGE_CATEGORY_ICON: Record<PassageCategory, LucideIcon> = {
  science: FlaskConical,
  history: Landmark,
  psychology: Brain,
  biography: User,
  business: Briefcase,
  technology: Cpu,
  motivation: Flame,
  'general-knowledge': Compass,
}

export function estimateWpm(difficulty: PassageDifficulty): number {
  return Math.round(60000 / PASSAGE_MS_PER_WORD[difficulty])
}

export function estimateReadingTimeSec(wordCount: number, difficulty: PassageDifficulty): number {
  return Math.round((wordCount * PASSAGE_MS_PER_WORD[difficulty]) / 1000)
}

export function formatReadingTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes === 0) return `${remainingSeconds}s`
  return remainingSeconds === 0 ? `${minutes} min` : `${minutes} min ${remainingSeconds}s`
}
