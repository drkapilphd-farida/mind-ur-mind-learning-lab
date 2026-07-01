// Exercise Registry™ — auto-registration and discovery.
//
// Every exercise calls registerExercise() on import. No hardcoded routing.
// The registry enables Admin CMS, exercise discovery, and Lab configuration
// without code changes — only new definition files are needed.
//
// Uses ExerciseDefinition<Record<string, unknown>> so ANY ExerciseDefinition<TConfig>
// can register regardless of its config shape.

import type { ExerciseDefinition } from '@/types/exercise-engine'
import type { ExerciseRegistryEntry } from '@/types/exercise-engine/builder'

// ── Registry store ─────────────────────────────────────────────────────────

type AnyDefinition = ExerciseDefinition<Record<string, unknown>>
const REGISTRY = new Map<string, AnyDefinition>()

// ── Registration ──────────────────────────────────────────────────────────

// Accepts any ExerciseDefinition<TConfig> via a cast — exercises don't need
// to extend ExerciseBuilderConfig to register.
export function registerExercise(
  definition: ExerciseDefinition<Record<string, unknown>>,
): void {
  REGISTRY.set(definition.id, definition)
}

// ── Lookup ────────────────────────────────────────────────────────────────

export function getExercise(id: string): AnyDefinition | null {
  return REGISTRY.get(id) ?? null
}

// ── Discovery ─────────────────────────────────────────────────────────────

export function listExercises(labId?: string): ExerciseRegistryEntry[] {
  const all = Array.from(REGISTRY.values())
  const filtered = labId ? all.filter((d) => d.labId === labId) : all
  return filtered.map(toRegistryEntry)
}

export function listExercisesByContentType(
  contentType: string,
): ExerciseRegistryEntry[] {
  return Array.from(REGISTRY.values())
    .filter((d) => d.contentType === contentType)
    .map(toRegistryEntry)
}

export function listExercisesByLab(labId: string): AnyDefinition[] {
  return Array.from(REGISTRY.values()).filter((d) => d.labId === labId)
}

export function isRegistered(id: string): boolean {
  return REGISTRY.has(id)
}

export function getRegistrySize(): number {
  return REGISTRY.size
}

// ── Helper ─────────────────────────────────────────────────────────────────

function toRegistryEntry(d: AnyDefinition): ExerciseRegistryEntry {
  // Config may be ExerciseBuilderConfig or a custom shape — access safely
  const cfg = d.config as Record<string, unknown>
  return {
    id: d.id,
    title: d.title,
    labId: d.labId,
    href: d.href,
    contentType: d.contentType,
    displayType: (cfg?.displayType as ExerciseRegistryEntry['displayType']) ?? 'single-word',
    presentationMode: (cfg?.presentationMode as ExerciseRegistryEntry['presentationMode']) ?? 'flash',
    datasetId: (cfg?.datasetId as string | undefined) ?? d.dataset.id,
    isValid: true,
    registeredAt: Date.now(),
  }
}

// ── Bulk registration ──────────────────────────────────────────────────────

// Call once at app startup or from Admin CMS to populate the registry.
// Each definition file must call registerExercise() to be discoverable.
export function registerAllExercises(): void {
  void import('@/features/rapid-visual-intelligence/definitions/flashWordsDefinition')
  void import('@/features/rapid-visual-intelligence/definitions/flashNumbersDefinition')
  void import('@/features/rapid-visual-intelligence/definitions/flashSymbolsDefinition')
  void import('@/features/rapid-visual-intelligence/definitions/flashImagesDefinition')
  void import('@/features/rapid-visual-intelligence/definitions/flashPhrasesDefinition')
  // Future exercises: add one line here
}
