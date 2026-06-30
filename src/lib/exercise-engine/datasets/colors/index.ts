// Colors dataset — 24 color names for visual intelligence training.
// Used by future Color Recognition and Right Brain exercises.
// metadata.colorHex: used by exercises that render actual color swatches.

import { createDataset } from '../../contentEngine'

export const COLORS_DATASET = createDataset({
  id: 'en-colors-foundation',
  locale: 'en',
  contentType: 'word',
  rawItems: [
    // Beginner: primary and universally-known colors
    { content: 'red',    difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#E53E3E', assetType: 'color' } },
    { content: 'blue',   difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#3182CE', assetType: 'color' } },
    { content: 'green',  difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#38A169', assetType: 'color' } },
    { content: 'yellow', difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#ECC94B', assetType: 'color' } },
    { content: 'black',  difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#1A202C', assetType: 'color' } },
    { content: 'white',  difficulty: 'beginner', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#FFFFFF', assetType: 'color' } },

    // Easy: secondary colors and common named colors
    { content: 'orange', difficulty: 'easy', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#ED8936', assetType: 'color' } },
    { content: 'purple', difficulty: 'easy', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#805AD5', assetType: 'color' } },
    { content: 'pink',   difficulty: 'easy', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#ED64A6', assetType: 'color' } },
    { content: 'brown',  difficulty: 'easy', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#975A16', assetType: 'color' } },
    { content: 'gray',   difficulty: 'easy', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#718096', assetType: 'color' } },
    { content: 'gold',   difficulty: 'easy', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#D69E2E', assetType: 'color' } },

    // Medium: less common but widely-known color names
    { content: 'indigo',  difficulty: 'medium', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#5A67D8', assetType: 'color' } },
    { content: 'violet',  difficulty: 'medium', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#9F7AEA', assetType: 'color' } },
    { content: 'crimson', difficulty: 'medium', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#C53030', assetType: 'color' } },
    { content: 'scarlet', difficulty: 'medium', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#FC4444', assetType: 'color' } },
    { content: 'amber',   difficulty: 'medium', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#F6AD55', assetType: 'color' } },
    { content: 'coral',   difficulty: 'medium', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#FC8181', assetType: 'color' } },

    // Advanced: technical or precise color names
    { content: 'magenta', difficulty: 'advanced', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#D53F8C', assetType: 'color' } },
    { content: 'cyan',    difficulty: 'advanced', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#00B5D8', assetType: 'color' } },
    { content: 'maroon',  difficulty: 'advanced', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#822727', assetType: 'color' } },
    { content: 'teal',    difficulty: 'advanced', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#319795', assetType: 'color' } },
    { content: 'ochre',   difficulty: 'advanced', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#B7791F', assetType: 'color' } },
    { content: 'sienna',  difficulty: 'advanced', categories: ['visualization', 'right-brain'], metadata: { colorHex: '#9B2335', assetType: 'color' } },
  ],
})
