import type { Metadata } from 'next'
import { FoundationJourneyExperience } from '@/features/visual-intelligence/components/FoundationJourneyExperience'
import { getImagePersistenceSessionCount, getRecentImagePersistenceImageIds } from '@/features/visual-intelligence/image-persistence/imagePersistenceQueries'
import { selectImageForSession, getCycleIndex } from '@/features/visual-intelligence/image-persistence/imageRotation'

export const metadata: Metadata = {
  title: 'Foundation Journey™ — Visual Intelligence Lab™',
}

// One route, one mounted client component managing all 5 stage phases plus
// completion internally — no per-stage routes, no menus, no exercise
// selection. See FoundationJourneyExperience.tsx for the phase state machine.
//
// Sprint-3B: Stage 3 (Image Persistence Challenge™) now needs one image
// chosen from the categorized library (imageLibrary.ts) via intelligent
// category rotation (imageRotation.ts), not plain random selection. The
// rotation's only state is the learner's own completed-session count,
// already sitting in the existing image_persistence_sessions table — no
// schema change. Everything else about this route is unchanged from
// Sprint-3A.
export default async function FoundationJourneyPage(): Promise<React.JSX.Element> {
  const [sessionCount, recentImageIds] = await Promise.all([
    getImagePersistenceSessionCount(),
    getRecentImagePersistenceImageIds(),
  ])
  const selectedImage = selectImageForSession(sessionCount, recentImageIds)
  const cycleIndex = getCycleIndex(sessionCount)

  return (
    <FoundationJourneyExperience
      imagePersistence={{
        image: selectedImage,
        cycleIndex,
      }}
    />
  )
}
