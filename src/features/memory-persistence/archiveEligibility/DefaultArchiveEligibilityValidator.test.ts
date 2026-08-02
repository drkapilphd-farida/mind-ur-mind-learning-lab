import { describe, expect, it } from 'vitest'
import { createArchiveEligibilityValidator } from './DefaultArchiveEligibilityValidator'
import { makeMemory, makeRetentionMetadata } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('DefaultArchiveEligibilityValidator', () => {
  const validator = createArchiveEligibilityValidator()

  describe('isEligibleForArchive', () => {
    it('is eligible for an active, non-excluded memory', () => {
      expect(validator.isEligibleForArchive(makeMemory({ lifecycle: 'active' }), null)).toBe(true)
    })

    it('is not eligible for a non-active memory', () => {
      expect(validator.isEligibleForArchive(makeMemory({ lifecycle: 'archived' }), null)).toBe(false)
    })

    it('is not eligible when cleanup-excluded', () => {
      const metadata = makeRetentionMetadata({ cleanupExcluded: true })
      expect(validator.isEligibleForArchive(makeMemory({ lifecycle: 'active' }), metadata)).toBe(false)
    })

    it('is eligible for a pinned active memory (archiving is reversible)', () => {
      expect(validator.isEligibleForArchive(makeMemory({ lifecycle: 'active', pinned: true }), null)).toBe(true)
    })
  })

  describe('isEligibleForDeletion', () => {
    it('is eligible for a non-deleted, non-pinned, non-excluded memory', () => {
      expect(validator.isEligibleForDeletion(makeMemory({ lifecycle: 'archived', pinned: false }), null, NOW)).toBe(true)
    })

    it('is not eligible for an already-deleted memory', () => {
      expect(validator.isEligibleForDeletion(makeMemory({ lifecycle: 'deleted' }), null, NOW)).toBe(false)
    })

    it('is not eligible for a pinned memory', () => {
      expect(validator.isEligibleForDeletion(makeMemory({ lifecycle: 'archived', pinned: true }), null, NOW)).toBe(false)
    })

    it('is not eligible when cleanup-excluded', () => {
      const metadata = makeRetentionMetadata({ cleanupExcluded: true })
      expect(validator.isEligibleForDeletion(makeMemory({ lifecycle: 'archived' }), metadata, NOW)).toBe(false)
    })

    it('is not eligible while under an active retention extension', () => {
      const metadata = makeRetentionMetadata({ retentionExtendedUntil: '2026-12-01T00:00:00.000Z' })
      expect(validator.isEligibleForDeletion(makeMemory({ lifecycle: 'archived' }), metadata, NOW)).toBe(false)
    })

    it('is eligible once a retention extension has expired', () => {
      const metadata = makeRetentionMetadata({ retentionExtendedUntil: '2026-01-01T00:00:00.000Z' })
      expect(validator.isEligibleForDeletion(makeMemory({ lifecycle: 'archived' }), metadata, NOW)).toBe(true)
    })
  })

  describe('isEligibleForRetentionExtension', () => {
    it('is eligible for any non-deleted memory', () => {
      expect(validator.isEligibleForRetentionExtension(makeMemory({ lifecycle: 'active' }))).toBe(true)
      expect(validator.isEligibleForRetentionExtension(makeMemory({ lifecycle: 'archived' }))).toBe(true)
    })

    it('is not eligible for a deleted memory', () => {
      expect(validator.isEligibleForRetentionExtension(makeMemory({ lifecycle: 'deleted' }))).toBe(false)
    })
  })

  describe('isEligibleForCleanupExclusion', () => {
    it('is eligible for any non-deleted memory', () => {
      expect(validator.isEligibleForCleanupExclusion(makeMemory({ lifecycle: 'active' }))).toBe(true)
    })

    it('is not eligible for a deleted memory', () => {
      expect(validator.isEligibleForCleanupExclusion(makeMemory({ lifecycle: 'deleted' }))).toBe(false)
    })
  })
})
