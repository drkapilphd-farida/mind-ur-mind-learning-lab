'use client'

import { useState } from 'react'
import { DiscoverWelcome } from './components/DiscoverWelcome'
import { ReadingSprint, type ReadingSprintResult } from './components/ReadingSprint'
import { MemoryChallenge, type MemoryChallengeResult } from './components/MemoryChallenge'
import { FocusChallenge, type FocusChallengeResult } from './components/FocusChallenge'
import { LeadCaptureModal, type LeadCaptureResult } from './components/LeadCaptureModal'
import { MindProfileDashboard } from './components/MindProfileDashboard'
import { QuantumOfferPage } from './components/QuantumOfferPage'

// Standalone preview route chaining the lead-magnet's full seven screens
// — lets you click through Welcome → Reading Sprint → Memory Challenge
// → Focus Challenge → Lead Capture → Mind Profile Dashboard → Quantum
// Offer Page and see every onStart/onComplete/onSuccess/onEnterDashboard/
// onClaimAccess callback actually fire, without wiring this into the
// real discover-learning-potential funnel yet.
type PreviewStep =
  | 'welcome'
  | 'reading-sprint'
  | 'memory-challenge'
  | 'focus-challenge'
  | 'lead-capture'
  | 'mind-profile-dashboard'
  | 'quantum-offer'
  | 'done'

export default function DiscoverWelcomePreviewPage(): React.JSX.Element {
  const [step, setStep] = useState<PreviewStep>('welcome')
  const [readingResult, setReadingResult] = useState<ReadingSprintResult | null>(null)
  const [memoryResult, setMemoryResult] = useState<MemoryChallengeResult | null>(null)
  const [focusResult, setFocusResult] = useState<FocusChallengeResult | null>(null)
  const [leadResult, setLeadResult] = useState<LeadCaptureResult | null>(null)

  if (step === 'reading-sprint') {
    return (
      <ReadingSprint
        onComplete={(result) => {
          setReadingResult(result)
          setStep('memory-challenge')
        }}
      />
    )
  }

  if (step === 'memory-challenge') {
    return (
      <MemoryChallenge
        onComplete={(result) => {
          setMemoryResult(result)
          setStep('focus-challenge')
        }}
      />
    )
  }

  if (step === 'focus-challenge') {
    return (
      <FocusChallenge
        onComplete={(result) => {
          setFocusResult(result)
          setStep('lead-capture')
        }}
      />
    )
  }

  if (step === 'lead-capture' && readingResult !== null && memoryResult !== null && focusResult !== null) {
    return (
      <LeadCaptureModal
        readingWpm={readingResult.wpm}
        memoryPercent={memoryResult.efficiencyPercent}
        focusPercent={focusResult.attentionStabilityPercent}
        onSuccess={(result) => {
          setLeadResult(result)
          setStep('mind-profile-dashboard')
        }}
      />
    )
  }

  if (step === 'mind-profile-dashboard' && leadResult !== null && readingResult !== null) {
    return (
      <MindProfileDashboard
        fullName={leadResult.fullName}
        readingWpm={leadResult.readingWpm}
        readingScore={readingResult.score}
        memoryEfficiencyPercent={leadResult.memoryPercent}
        focusStabilityPercent={leadResult.focusPercent}
        onEnterDashboard={() => setStep('quantum-offer')}
      />
    )
  }

  if (step === 'quantum-offer' && leadResult !== null) {
    return (
      <QuantumOfferPage
        fullName={leadResult.fullName}
        readingWpm={leadResult.readingWpm}
        onClaimAccess={() => setStep('done')}
      />
    )
  }

  if (step === 'done') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <p className="text-lg font-medium text-foreground">onClaimAccess fired ✅</p>
        <div className="flex flex-col gap-2 text-left">
          <pre className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
            {JSON.stringify({ readingResult, memoryResult, focusResult, leadResult }, null, 2)}
          </pre>
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">
          Replace this placeholder with your real checkout/enrollment flow once you wire this up.
        </p>
      </div>
    )
  }

  return <DiscoverWelcome onStart={() => setStep('reading-sprint')} />
}
