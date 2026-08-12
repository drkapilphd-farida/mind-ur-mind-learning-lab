// Sensory Hologram Builder™ — the fixed, bilingual guided-meditation
// script. Deliberately separate from hologramDatabase.ts's own (large)
// content-authoring surface: this file owns HOW the session speaks
// (the framing lines every goal shares), never WHAT gets visualized (the
// per-goal sensory lines) — buildNarrationPhases splices the two
// together. Five phases — Grounding → Sight → Touch → Smell/Taste →
// Synthesis — matching the spec's own named journey structure.
import type { HologramGoal } from './hologramDatabase'

export type HologramPhaseId = 'grounding' | 'sight' | 'touch' | 'taste-smell' | 'synthesis'

export const HOLOGRAM_PHASE_IDS: readonly HologramPhaseId[] = ['grounding', 'sight', 'touch', 'taste-smell', 'synthesis']

export type NarrationLine = { en: string; hi: string }

export type NarrationPhase = {
  id: HologramPhaseId
  labelEn: string
  labelHi: string
  lines: NarrationLine[]
}

// Lowercases just the first character of an English title so it reads
// naturally mid-sentence ("...begin to see your dream job offer taking
// shape...") without an awkward capital in the middle of a clause. Hindi
// titles need no such transform — Devanagari has no case distinction.
function midSentence(titleEn: string): string {
  return titleEn.charAt(0).toLowerCase() + titleEn.slice(1)
}

const GROUNDING_LINES: NarrationLine[] = [
  {
    en: 'Find a comfortable position, and gently close your eyes.',
    hi: 'एक आरामदायक स्थिति में बैठें, और धीरे से अपनी आँखें बंद करें।',
  },
  {
    en: 'Take a slow, deep breath in... and let it go.',
    hi: 'धीरे से एक गहरी साँस लें... और उसे छोड़ दें।',
  },
  {
    en: 'Let your body soften, and your mind grow still.',
    hi: 'अपने शरीर को शिथिल होने दें, और अपने मन को शांत होने दें।',
  },
  {
    en: 'Just breathe, in this stillness, for a moment longer.',
    hi: 'बस साँस लें, इस शांति में, एक पल और।',
  },
  {
    en: 'You are safe here. You are ready to begin.',
    hi: 'आप यहाँ सुरक्षित हैं। आप शुरू करने के लिए तैयार हैं।',
  },
]

const SIGHT_OUTRO_LINE: NarrationLine = {
  en: 'Let the colors, the light, every detail become vivid and real.',
  hi: 'रंगों को, रोशनी को, हर विवरण को जीवंत और वास्तविक होने दें।',
}

const TOUCH_INTRO_LINE: NarrationLine = {
  en: 'Now reach out, and feel it beneath your fingertips.',
  hi: 'अब हाथ बढ़ाएं, और इसे अपनी उंगलियों के नीचे महसूस करें।',
}
const TOUCH_OUTRO_LINE: NarrationLine = {
  en: 'Notice the texture, the temperature, the weight of this moment.',
  hi: 'इस पल की बनावट, तापमान, और भार को महसूस करें।',
}

const TASTE_SMELL_INTRO_LINE: NarrationLine = {
  en: 'Breathe in deeply, and let every scent fill your senses.',
  hi: 'गहरी सांस लें, और हर सुगंध को अपनी इंद्रियों में भरने दें।',
}
const TASTE_SMELL_OUTRO_LINE: NarrationLine = {
  en: 'This feeling is already yours.',
  hi: 'यह एहसास पहले से ही आपका है।',
}

const SYNTHESIS_HOLD_LINE: NarrationLine = {
  en: 'Hold this feeling. Know that it is already becoming real.',
  hi: 'इस एहसास को थामे रखें। जानें कि यह पहले से ही वास्तविक बन रहा है।',
}
const SYNTHESIS_CARRY_LINE: NarrationLine = {
  en: 'Carry this feeling with you as you return.',
  hi: 'जैसे ही आप लौटें, इस एहसास को अपने साथ ले जाएं।',
}
const SYNTHESIS_CLOSE_LINE: NarrationLine = {
  en: 'When you are ready, gently open your eyes.',
  hi: 'जब आप तैयार हों, धीरे से अपनी आँखें खोलें।',
}

function sightIntroLine(goal: HologramGoal): NarrationLine {
  return {
    en: `In your mind's eye, begin to see ${midSentence(goal.titleEn)} taking shape before you.`,
    hi: `अपने मन की आँखों से, ${goal.titleHi} को अपने सामने आकार लेते हुए देखना शुरू करें।`,
  }
}

function synthesisIntroLine(goal: HologramGoal): NarrationLine {
  return {
    en: `Now bring it all together — the sight, the touch, the scent — one complete hologram of ${midSentence(goal.titleEn)}.`,
    hi: `अब इन सबको एक साथ लाएं — दृश्य, स्पर्श, सुगंध — ${goal.titleHi} का एक पूर्ण होलोग्राम।`,
  }
}

// Composes the fixed framing script with one goal's own sensory lines
// into the session's full 5-phase narration. Pure and deterministic —
// the same goal always produces the same script, so the Canvas can
// safely rebuild it from a stored goal id without re-deriving randomness.
export function buildNarrationPhases(goal: HologramGoal): NarrationPhase[] {
  return [
    { id: 'grounding', labelEn: 'Grounding', labelHi: 'स्थिरता', lines: [...GROUNDING_LINES] },
    { id: 'sight', labelEn: 'Sight', labelHi: 'दृष्टि', lines: [sightIntroLine(goal), goal.sight, SIGHT_OUTRO_LINE] },
    { id: 'touch', labelEn: 'Touch', labelHi: 'स्पर्श', lines: [TOUCH_INTRO_LINE, goal.touch, TOUCH_OUTRO_LINE] },
    {
      id: 'taste-smell',
      labelEn: 'Smell & Taste',
      labelHi: 'सुगंध और स्वाद',
      lines: [TASTE_SMELL_INTRO_LINE, goal.tasteSmell, TASTE_SMELL_OUTRO_LINE],
    },
    {
      id: 'synthesis',
      labelEn: 'Full Hologram Synthesis',
      labelHi: 'पूर्ण होलोग्राम संश्लेषण',
      lines: [synthesisIntroLine(goal), goal.affirmation, SYNTHESIS_HOLD_LINE, SYNTHESIS_CARRY_LINE, SYNTHESIS_CLOSE_LINE],
    },
  ]
}

export function countTotalNarrationLines(phases: readonly NarrationPhase[]): number {
  return phases.reduce((sum, phase) => sum + phase.lines.length, 0)
}
