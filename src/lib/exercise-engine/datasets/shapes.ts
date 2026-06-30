// Shapes dataset — 20 items for visual recognition and right-brain training.
// Content is the shape name; the exercise player renders the shape visually
// (via CSS, SVG, or lucide icon). Metadata carries the display hint.
// Categorised for Visualization and Right Brain training.

import { createDataset } from '../contentEngine'

export const SHAPES_DATASET = createDataset({
  id: 'shapes-foundation',
  locale: 'en',
  contentType: 'shape',
  rawItems: [
    // ── Beginner (7 items: universally recognised, highly distinct silhouettes) ──
    { content: 'circle',    difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { sides: 0, icon: 'Circle' } },
    { content: 'square',    difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { sides: 4, icon: 'Square' } },
    { content: 'triangle',  difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { sides: 3, icon: 'Triangle' } },
    { content: 'star',      difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { sides: 5, icon: 'Star' } },
    { content: 'heart',     difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { sides: 0, icon: 'Heart' } },
    { content: 'diamond',   difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { sides: 4, icon: 'Diamond' } },
    { content: 'arrow',     difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { sides: 0, icon: 'ArrowRight' } },

    // ── Easy (6 items: recognisable but less universal) ──
    { content: 'rectangle', difficulty: 'easy', categories: ['visualization', 'right-brain'], metadata: { sides: 4 } },
    { content: 'oval',      difficulty: 'easy', categories: ['visualization', 'right-brain'], metadata: { sides: 0 } },
    { content: 'pentagon',  difficulty: 'easy', categories: ['visualization', 'right-brain'], metadata: { sides: 5 } },
    { content: 'hexagon',   difficulty: 'easy', categories: ['visualization', 'right-brain'], metadata: { sides: 6, icon: 'Hexagon' } },
    { content: 'cross',     difficulty: 'easy', categories: ['visualization', 'right-brain'], metadata: { sides: 0 } },
    { content: 'crescent',  difficulty: 'easy', categories: ['visualization', 'right-brain'], metadata: { sides: 0 } },

    // ── Medium (4 items: less commonly trained visually) ──
    { content: 'octagon',   difficulty: 'medium', categories: ['visualization', 'right-brain'], metadata: { sides: 8, icon: 'Octagon' } },
    { content: 'spiral',    difficulty: 'medium', categories: ['visualization', 'right-brain'], metadata: { sides: 0 } },
    { content: 'zigzag',    difficulty: 'medium', categories: ['visualization', 'focus'] },
    { content: 'trapezoid', difficulty: 'medium', categories: ['visualization', 'right-brain'], metadata: { sides: 4 } },

    // ── Advanced (3 items: less common, require visual precision) ──
    { content: 'rhombus',  difficulty: 'advanced', categories: ['visualization', 'right-brain'], metadata: { sides: 4 } },
    { content: 'heptagon', difficulty: 'advanced', categories: ['visualization', 'right-brain'], metadata: { sides: 7 } },
    { content: 'ellipse',  difficulty: 'advanced', categories: ['visualization', 'right-brain'] },
  ],
})
