// Memory Discovery™ Scene Dataset — small, named clusters of everyday
// objects for Image Recall™.
//
// contentType is 'scene', a structurally different shape from every other
// dataset here: `content` is an internal label only (never shown), and
// the scene's display title plus its object list live in `metadata`.
// Replaces Pattern Memory™'s removed 'geometric-pattern' type, which had
// no other consumer.
//
// Recognition decoys are pulled at query time from the existing
// everyday-object dataset (Apple, Book, Key...) rather than authored
// here — reuse, not duplication.
//
// 3 scenes/tier (up from 1) — a later refinement found a 1-per-tier pool
// meant Image Recall™ showed the literal same scene every single replay
// at a given difficulty. Query time still only ever pulls one scene per
// session (count: 1 in loadContent.ts) — this just gives that pick
// somewhere to actually vary.

import { createDataset } from '@/lib/exercise-engine/contentEngine'

export type SceneMetadata = { title: string; objects: string[] }

export const MEMORY_DISCOVERY_SCENE_DATASET = createDataset({
  id: 'en-memory-discovery-scenes',
  locale: 'en',
  contentType: 'scene',
  rawItems: [
    // Beginner
    {
      content: 'study-table',
      difficulty: 'beginner',
      categories: ['memory'],
      metadata: { title: 'Study Table', objects: ['book', 'lamp', 'pen', 'notebook', 'mug'] },
    },
    {
      content: 'classroom',
      difficulty: 'beginner',
      categories: ['memory'],
      metadata: { title: 'Classroom', objects: ['chalkboard', 'desk', 'chair', 'clock', 'backpack'] },
    },
    {
      content: 'bedroom',
      difficulty: 'beginner',
      categories: ['memory'],
      metadata: { title: 'Bedroom', objects: ['pillow', 'blanket', 'lamp', 'clock', 'shoe'] },
    },

    // Easy
    {
      content: 'library',
      difficulty: 'easy',
      categories: ['memory'],
      metadata: { title: 'Library', objects: ['bookshelf', 'ladder', 'lamp', 'chair', 'magazine'] },
    },
    {
      content: 'garden-shed',
      difficulty: 'easy',
      categories: ['memory'],
      metadata: { title: 'Garden Shed', objects: ['basket', 'ladder', 'bottle', 'umbrella', 'candle'] },
    },
    {
      content: 'hallway',
      difficulty: 'easy',
      categories: ['memory'],
      metadata: { title: 'Hallway', objects: ['mirror', 'umbrella', 'basket', 'suitcase', 'scarf'] },
    },

    // Medium
    {
      content: 'kitchen',
      difficulty: 'medium',
      categories: ['memory'],
      metadata: { title: 'Kitchen', objects: ['kettle', 'bowl', 'spoon', 'knife', 'apron'] },
    },
    {
      content: 'music-room',
      difficulty: 'medium',
      categories: ['memory'],
      metadata: { title: 'Music Room', objects: ['violin', 'lantern', 'compass', 'bracelet', 'hammer'] },
    },
    {
      content: 'attic',
      difficulty: 'medium',
      categories: ['memory'],
      metadata: { title: 'Attic', objects: ['telescope', 'envelope', 'kettle', 'anchor', 'binoculars'] },
    },

    // Advanced
    {
      content: 'school-bag',
      difficulty: 'advanced',
      categories: ['memory'],
      metadata: { title: 'School Bag', objects: ['pencil', 'eraser', 'ruler', 'notebook', 'bottle'] },
    },
    {
      content: 'workshop',
      difficulty: 'advanced',
      categories: ['memory'],
      metadata: { title: 'Workshop', objects: ['hourglass', 'easel', 'quill', 'lockbox', 'pendulum'] },
    },
    {
      content: 'observatory',
      difficulty: 'advanced',
      categories: ['memory'],
      metadata: { title: 'Observatory', objects: ['sundial', 'spyglass', 'chandelier', 'birdcage', 'weathervane'] },
    },

    // Expert
    {
      content: 'workspace',
      difficulty: 'expert',
      categories: ['memory'],
      metadata: { title: 'Workspace', objects: ['laptop', 'stapler', 'pen', 'folder', 'mug'] },
    },
    {
      content: 'laboratory',
      difficulty: 'expert',
      categories: ['memory'],
      metadata: { title: 'Laboratory', objects: ['barometer', 'gyroscope', 'caliper', 'crucible', 'metronome'] },
    },
    {
      content: 'archive-room',
      difficulty: 'expert',
      categories: ['memory'],
      metadata: { title: 'Archive Room', objects: ['astrolabe', 'sextant', 'monocle', 'abacus', 'chronometer'] },
    },
  ],
})
