'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Mic, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { ArrivalBackground } from './ArrivalBackground'
import { AIPresenceLogo } from './AIPresenceLogo'

type RecordingState = 'idle' | 'requesting' | 'recording' | 'permission-denied' | 'unsupported' | 'completed'

const FUTURE_FLOW = [
  'AI Transcription',
  'AI Understanding',
  'Learning Blueprint™',
  'Learning Workspace™',
  'Smart Notes™',
  'Mind Map™',
  'Flashcards™',
  'MCQs™',
  'Memory Test™',
  'Revision™',
  'Learning Proof™',
  'Dashboard™',
] as const

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// Matches AIPresenceLogo/RecordAndLearnIllustration's glow colour — one
// consistent brand accent, not a new hue (Sprint LW-1C.1).
const RECORD_GLOW_COLOR = '#4FE0FF'

// Sprint LW-1C — Record & Learn™. Real, working client-side audio capture
// (getUserMedia + MediaRecorder) — the honest middle ground the brief asks
// for between a fake "Coming Soon" placeholder (explicitly forbidden) and
// a fully-implemented recording backend (also explicitly out of scope):
// capture is genuinely real, nothing recorded is ever uploaded, stored, or
// sent anywhere — no backend exists for that yet, disclosed plainly here
// and in the production handoff. Every MediaStream track is stopped the
// instant recording ends or this component unmounts, so the browser's
// microphone-in-use indicator never lingers after the user leaves.
export function RecordAndLearnExperience(): React.JSX.Element {
  const [state, setState] = useState<RecordingState>('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const releaseMicrophone = useCallback((): void => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    mediaRecorderRef.current = null
  }, [])

  // Release the microphone if the user navigates away mid-recording.
  useEffect(() => releaseMicrophone, [releaseMicrophone])

  const handleStart = async (): Promise<void> => {
    if (typeof navigator === 'undefined' || navigator.mediaDevices?.getUserMedia === undefined || typeof MediaRecorder === 'undefined') {
      setState('unsupported')
      return
    }

    setState('requesting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      recorder.start()
      setElapsedSeconds(0)
      setState('recording')
      timerRef.current = setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000)
    } catch {
      setState('permission-denied')
    }
  }

  const handleStop = (): void => {
    mediaRecorderRef.current?.stop()
    releaseMicrophone()
    setState('completed')
  }

  const statusAnnouncement =
    state === 'recording' ? 'Recording started.' : state === 'completed' ? 'Recording stopped.' : state === 'permission-denied' ? 'Microphone access was not granted.' : ''

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <ArrivalBackground />
      <p className="sr-only" role="status" aria-live="polite">
        {statusAnnouncement}
      </p>

      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-9 text-center">
        <AIPresenceLogo size={84} />

        {(state === 'idle' || state === 'requesting') && (
          <>
            <div>
              <h1 className={TYPOGRAPHY.display}>Record once. Learn forever.</h1>
              <p className={cn(TYPOGRAPHY.bodyLarge, 'mx-auto mt-3 max-w-md text-muted-foreground')}>We&rsquo;ll understand it for you.</p>
            </div>

            <div className="relative flex size-28 items-center justify-center">
              {!prefersReducedMotion && (
                <div className="absolute inset-0 rounded-full opacity-20">
                  <div className="size-full rounded-full blur-2xl" style={{ backgroundColor: RECORD_GLOW_COLOR, animation: 'breathing-pulse 5s ease-in-out infinite' }} />
                </div>
              )}
              <div className="relative flex size-28 items-center justify-center rounded-full border border-border bg-background/60 backdrop-blur-sm">
                <Mic className="size-10 text-foreground/70" strokeWidth={1.5} aria-hidden="true" />
              </div>
            </div>

            <Button size="lg" className="rounded-full px-8" onClick={() => void handleStart()} disabled={state === 'requesting'}>
              {state === 'requesting' ? 'Waiting for microphone…' : (
                <>
                  Start Recording <span aria-hidden="true">→</span>
                </>
              )}
            </Button>

            <Link href="/welcome/choose-method" className={cn(TYPOGRAPHY.caption, 'underline-offset-4 hover:underline')}>
              Back to Choose Learning Method
            </Link>
          </>
        )}

        {state === 'recording' && (
          <>
            <div>
              <h1 className={TYPOGRAPHY.display}>Ready to learn.</h1>
              <p className={cn(TYPOGRAPHY.bodyLarge, 'mx-auto mt-3 max-w-md text-muted-foreground')}>Bring your knowledge — we&rsquo;re listening.</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn('size-2.5 rounded-full bg-red-500', !prefersReducedMotion && 'animate-pulse')}
                  aria-hidden="true"
                />
                <span className={cn(TYPOGRAPHY.h2, 'tabular-nums')}>{formatElapsed(elapsedSeconds)}</span>
              </div>
              <p className={TYPOGRAPHY.caption}>Recording in progress</p>
            </div>

            <Button size="lg" variant="outline" className="gap-2 rounded-full px-8" onClick={handleStop}>
              <Square className="size-4" aria-hidden="true" />
              Stop Recording
            </Button>
          </>
        )}

        {state === 'permission-denied' && (
          <>
            <div>
              <h1 className={TYPOGRAPHY.h1}>We couldn&rsquo;t access your microphone</h1>
              <p className={cn(TYPOGRAPHY.bodyLarge, 'mx-auto mt-3 max-w-md text-muted-foreground')}>
                Quantum Mind needs microphone access to record. Check your browser&rsquo;s permission settings and try again.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button size="lg" className="rounded-full px-8" onClick={() => setState('idle')}>
                Try Again
              </Button>
              <Link href="/welcome/choose-method" className={cn(TYPOGRAPHY.caption, 'underline-offset-4 hover:underline')}>
                Back
              </Link>
            </div>
          </>
        )}

        {state === 'unsupported' && (
          <>
            <div>
              <h1 className={TYPOGRAPHY.h1}>Recording isn&rsquo;t available in this browser</h1>
              <p className={cn(TYPOGRAPHY.bodyLarge, 'mx-auto mt-3 max-w-md text-muted-foreground')}>
                Try a recent version of Chrome, Edge, or Safari, or bring your material with Document Mastery Studio™ instead.
              </p>
            </div>
            <Link href="/welcome/choose-method" className={cn(TYPOGRAPHY.caption, 'underline-offset-4 hover:underline')}>
              Back to Choose Learning Method
            </Link>
          </>
        )}

        {state === 'completed' && (
          <>
            <div>
              <h1 className={TYPOGRAPHY.h1}>Preparing your learning journey.</h1>
              <p className={cn(TYPOGRAPHY.bodyLarge, 'mx-auto mt-3 max-w-md text-muted-foreground')}>
                We&rsquo;ll understand it for you — turning what you recorded into a transcript, notes, and everything below.
              </p>
            </div>

            <div className="flex w-full flex-wrap items-center justify-center gap-2.5">
              {FUTURE_FLOW.map((stage) => (
                <span key={stage} className={cn(TYPOGRAPHY.caption, 'rounded-full border border-border/60 bg-muted/30 px-3.5 py-1.5')}>
                  {stage}
                </span>
              ))}
            </div>

            <Link href="/welcome/choose-method" className={cn(TYPOGRAPHY.caption, 'underline-offset-4 hover:underline')}>
              Back to Choose Learning Method
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
