'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WelcomeHero } from './WelcomeHero'
import { TrustCards } from './TrustCards'
import { CTASection } from './CTASection'

// Owns whether the brain has been tapped yet, purely to hide TrustCards
// and CTASection during the Opening Experience™ ("no cards, no CTA
// button"). WelcomeHero itself is always mounted and owns the entire
// animation timeline internally — this component never swaps it out for
// anything else.
export function WelcomeExperience(): React.JSX.Element {
  const router = useRouter()
  const [openingStarted, setOpeningStarted] = useState(false)

  const handleBrainTap = useCallback(() => setOpeningStarted(true), [])
  const handleOpeningComplete = useCallback(() => {
    router.push('/discover-your-brain/mystery-1')
  }, [router])

  return (
    <>
      <WelcomeHero onBrainTap={handleBrainTap} onOpeningComplete={handleOpeningComplete} />
      {!openingStarted && (
        <>
          <TrustCards />
          <CTASection />
        </>
      )}
    </>
  )
}
