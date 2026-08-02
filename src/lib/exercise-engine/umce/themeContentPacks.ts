// Universal Memory Content Engine™ (UMCE) — Sprint-4 FIX-03/FIX-04/FIX-06.
//
// Real, hand-authored theme packs — one real word list (Word Memory,
// "semantically coherent groups... Kitchen: Cup, Plate, Knife, Bottle,
// Spoon") and one real visual-glyph list (Visual Memory / Shape
// Recognition — real emoji, never a word, per FIX-04's own "Never use
// words. Never test reading.") per theme. Locale/context-nested so a
// real future language pack or domain pack is purely additive data (see
// `umceConfig.ts`'s own honest scope note) — only `en`/`general` is
// actually authored today.

import type { UmceContext, UmceTheme } from './umceConfig'
import type { Locale } from '@/types/exercise-engine'

export type ThemeContentPack = {
  words: readonly string[]
  visuals: readonly string[]
}

const EN_GENERAL_PACKS: Record<UmceTheme, ThemeContentPack> = {
  nature: {
    words: ['forest', 'river', 'mountain', 'flower', 'meadow', 'waterfall', 'valley', 'breeze', 'sunrise', 'rainbow', 'canyon', 'cliff', 'stream', 'wildflower'],
    visuals: ['🌲', '🌊', '⛰️', '🌸', '🍃', '🌈', '🌅', '🏞️'],
  },
  animals: {
    words: ['tiger', 'elephant', 'dolphin', 'eagle', 'panda', 'giraffe', 'penguin', 'wolf', 'rabbit', 'owl', 'zebra', 'kangaroo', 'otter', 'falcon'],
    visuals: ['🐯', '🐘', '🐬', '🦅', '🐼', '🦒', '🐧', '🦊'],
  },
  food: {
    words: ['pizza', 'mango', 'bread', 'cheese', 'noodles', 'pancake', 'avocado', 'chocolate', 'salad', 'soup', 'sandwich', 'coconut', 'honey', 'pasta'],
    visuals: ['🍕', '🥭', '🍞', '🧀', '🍜', '🥞', '🥑', '🍫'],
  },
  technology: {
    words: ['laptop', 'robot', 'satellite', 'sensor', 'circuit', 'software', 'keyboard', 'battery', 'camera', 'printer', 'router', 'microchip', 'drone', 'server'],
    visuals: ['💻', '🤖', '🛰️', '🔌', '📷', '🖨️', '🔋', '⌨️'],
  },
  space: {
    words: ['planet', 'comet', 'galaxy', 'asteroid', 'telescope', 'orbit', 'nebula', 'meteor', 'spacecraft', 'astronaut', 'moonlight', 'cosmos', 'starlight', 'constellation'],
    visuals: ['🪐', '☄️', '🌌', '🚀', '🌠', '🛸', '🌙', '⭐'],
  },
  sports: {
    words: ['football', 'cricket', 'tennis', 'hockey', 'marathon', 'cycling', 'swimming', 'wrestling', 'archery', 'badminton', 'volleyball', 'skating', 'boxing', 'golf'],
    visuals: ['⚽', '🏏', '🎾', '🏒', '🏃', '🚴', '🏊', '🤼'],
  },
  kitchen: {
    words: ['spoon', 'kettle', 'blender', 'oven', 'whisk', 'ladle', 'colander', 'saucepan', 'grater', 'spatula', 'teapot', 'toaster', 'apron', 'cutting board'],
    visuals: ['🥄', '🫖', '🔪', '🍳', '🧊', '🥣', '🧂', '🍽️'],
  },
  travel: {
    words: ['passport', 'suitcase', 'airport', 'compass', 'backpack', 'itinerary', 'hotel', 'ticket', 'journey', 'roadtrip', 'luggage', 'souvenir', 'boarding pass', 'destination'],
    visuals: ['🎒', '🛂', '✈️', '🧳', '🗺️', '🏨', '🎫', '🚗'],
  },
}

// Real, locale/context-nested lookup. Structured so adding a real future
// pack is one new entry — never a code change to the accessor below.
const THEME_CONTENT_PACKS: Partial<Record<Locale, Partial<Record<UmceContext, Record<UmceTheme, ThemeContentPack>>>>> = {
  en: { general: EN_GENERAL_PACKS },
}

// Honest fallback — a requested locale/context this engine doesn't have
// a real authored pack for yet resolves to the one real pack that always
// exists (`en`/`general`), never a fabricated placeholder.
export function getThemeContentPack(theme: UmceTheme, locale: Locale, context: UmceContext): ThemeContentPack {
  return THEME_CONTENT_PACKS[locale]?.[context]?.[theme] ?? EN_GENERAL_PACKS[theme]
}
