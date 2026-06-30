// Illustrations dataset — icon-based visual stimuli for Flash Images™ and
// Right Brain training. Each item carries iconPath metadata so exercises
// can render the actual icon alongside a text label.
//
// In production, imagePath would point to /datasets/illustrations/*.webp
// files. For demo purposes, lucide icon names serve as the visual reference.

import { createDataset } from '../../contentEngine'

export const ILLUSTRATIONS_DATASET = createDataset({
  id: 'en-illustrations-foundation',
  locale: 'en',
  contentType: 'icon',
  rawItems: [
    // Tier 1: universally recognised, highly distinct silhouettes (beginner)
    { content: 'Sun',      difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { iconPath: 'lucide:Sun',      altText: 'A bright sun',     assetType: 'icon' } },
    { content: 'Moon',     difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { iconPath: 'lucide:Moon',     altText: 'A crescent moon',  assetType: 'icon' } },
    { content: 'Star',     difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { iconPath: 'lucide:Star',     altText: 'A five-point star', assetType: 'icon' } },
    { content: 'Heart',    difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { iconPath: 'lucide:Heart',    altText: 'A heart shape',    assetType: 'icon' } },
    { content: 'Home',     difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { iconPath: 'lucide:Home',     altText: 'A house',          assetType: 'icon' } },
    { content: 'Eye',      difficulty: 'beginner', categories: ['visualization', 'reading'],     metadata: { iconPath: 'lucide:Eye',      altText: 'An open eye',      assetType: 'icon' } },
    { content: 'Flame',    difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { iconPath: 'lucide:Flame',    altText: 'A flame',          assetType: 'icon' } },
    { content: 'Cloud',    difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { iconPath: 'lucide:Cloud',    altText: 'A cloud',          assetType: 'icon' } },

    // Tier 2: common objects with some visual similarity (easy)
    { content: 'Brain',    difficulty: 'easy', categories: ['visualization', 'memory'],        metadata: { iconPath: 'lucide:Brain',    altText: 'A brain',          assetType: 'icon' } },
    { content: 'Book',     difficulty: 'easy', categories: ['visualization', 'reading'],       metadata: { iconPath: 'lucide:BookOpen', altText: 'An open book',     assetType: 'icon' } },
    { content: 'Target',   difficulty: 'easy', categories: ['visualization', 'focus'],         metadata: { iconPath: 'lucide:Target',   altText: 'A bullseye target', assetType: 'icon' } },
    { content: 'Trophy',   difficulty: 'easy', categories: ['visualization', 'right-brain'],   metadata: { iconPath: 'lucide:Trophy',   altText: 'A trophy',         assetType: 'icon' } },
    { content: 'Compass',  difficulty: 'easy', categories: ['visualization', 'right-brain'],   metadata: { iconPath: 'lucide:Compass',  altText: 'A compass',        assetType: 'icon' } },
    { content: 'Diamond',  difficulty: 'easy', categories: ['visualization', 'right-brain'],   metadata: { iconPath: 'lucide:Diamond',  altText: 'A diamond',        assetType: 'icon' } },
    { content: 'Bell',     difficulty: 'easy', categories: ['visualization', 'right-brain'],   metadata: { iconPath: 'lucide:Bell',     altText: 'A bell',           assetType: 'icon' } },
    { content: 'Shield',   difficulty: 'easy', categories: ['visualization', 'right-brain'],   metadata: { iconPath: 'lucide:Shield',   altText: 'A shield',         assetType: 'icon' } },

    // Tier 3: similar-looking icons requiring precise discrimination (medium)
    { content: 'Hexagon',  difficulty: 'medium', categories: ['visualization', 'right-brain'], metadata: { iconPath: 'lucide:Hexagon',  altText: 'A hexagon',        assetType: 'icon' } },
    { content: 'Octagon',  difficulty: 'medium', categories: ['visualization', 'right-brain'], metadata: { iconPath: 'lucide:Octagon',  altText: 'An octagon',       assetType: 'icon' } },
    { content: 'Circle',   difficulty: 'medium', categories: ['visualization', 'right-brain'], metadata: { iconPath: 'lucide:Circle',   altText: 'A circle',         assetType: 'icon' } },
    { content: 'Square',   difficulty: 'medium', categories: ['visualization', 'right-brain'], metadata: { iconPath: 'lucide:Square',   altText: 'A square',         assetType: 'icon' } },
    { content: 'Triangle', difficulty: 'medium', categories: ['visualization', 'right-brain'], metadata: { iconPath: 'lucide:Triangle', altText: 'A triangle',       assetType: 'icon' } },

    // Tier 4: abstract or complex icons (advanced/expert)
    { content: 'Network',  difficulty: 'advanced', categories: ['visualization', 'memory'],    metadata: { iconPath: 'lucide:Network',  altText: 'A network graph',  assetType: 'icon' } },
    { content: 'Layers',   difficulty: 'advanced', categories: ['visualization', 'memory'],    metadata: { iconPath: 'lucide:Layers',   altText: 'Stacked layers',   assetType: 'icon' } },
    { content: 'GitBranch',difficulty: 'expert',   categories: ['visualization', 'memory'],    metadata: { iconPath: 'lucide:GitBranch',altText: 'A branch diagram', assetType: 'icon' } },
  ],
})
