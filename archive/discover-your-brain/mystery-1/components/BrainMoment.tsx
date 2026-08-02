'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Square, Smile } from 'lucide-react'
import { MysteryLayout } from './MysteryLayout'

export type StimulusObjectType = 'shape' | 'color' | 'face'

export type StimulusObject = {
  type: StimulusObjectType
  topPercent: number
  leftPercent: number
}

export type BrainMomentResult = {
  order: number
  tapXPercent: number
  tapYPercent: number
  reactionTimeMs: number
  selectedObject: StimulusObjectType | 'empty-space'
}

type Phase = 'showing' | 'hidden' | 'waiting' | 'reacting'

const SHOW_MS = 1200
const HIDE_MS = 400
const REACT_MS = 450

type BrainMomentProps = {
  momentName: string
  order: number
  objects: readonly StimulusObject[]
  onCapture: (result: BrainMomentResult) => void
}

// Reusable for Scenes 3, 4 and 5 — same interaction every time, only the
// stimulus arrangement changes. No "was that right" feedback of any kind
// — we're observing behavior, not testing accuracy. After a tap, the
// tapped object responds with a brief, quiet acknowledgment before the
// experience moves on — never an instant jump.
export function BrainMoment({ momentName, order, objects, onCapture }: BrainMomentProps): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>('showing')
  const [tappedType, setTappedType] = useState<StimulusObjectType | null>(null)
  const mountTimeRef = useRef(performance.now())
  const canvasRef = useRef<HTMLDivElement>(null)
  const pendingResultRef = useRef<BrainMomentResult | null>(null)

  useEffect(() => {
    if (phase === 'showing') {
      const timer = setTimeout(() => setPhase('hidden'), SHOW_MS)
      return () => clearTimeout(timer)
    }
    if (phase === 'hidden') {
      const timer = setTimeout(() => {
        mountTimeRef.current = performance.now()
        setPhase('waiting')
      }, HIDE_MS)
      return () => clearTimeout(timer)
    }
    if (phase === 'reacting') {
      const timer = setTimeout(() => {
        if (pendingResultRef.current !== null) onCapture(pendingResultRef.current)
      }, REACT_MS)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [phase, onCapture])

  function handleTap(event: React.MouseEvent<HTMLDivElement>): void {
    if (phase !== 'waiting' || canvasRef.current === null) return

    const rect = canvasRef.current.getBoundingClientRect()
    const tapXPercent = ((event.clientX - rect.left) / rect.width) * 100
    const tapYPercent = ((event.clientY - rect.top) / rect.height) * 100
    const reactionTimeMs = Math.round(performance.now() - mountTimeRef.current)

    const target = event.target as HTMLElement
    const objectEl = target.closest<HTMLElement>('[data-object-type]')
    const objectType = objectEl?.dataset.objectType as StimulusObjectType | undefined
    const selectedObject = objectType ?? 'empty-space'

    pendingResultRef.current = { order, tapXPercent, tapYPercent, reactionTimeMs, selectedObject }
    setTappedType(objectType ?? null)
    setPhase('reacting')
  }

  const isInteractive = phase === 'waiting'

  return (
    <MysteryLayout>
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">{momentName}</p>

      {phase !== 'hidden' ? (
        <motion.div
          ref={canvasRef}
          onClick={handleTap}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={isInteractive ? 'relative cursor-pointer' : 'relative'}
        >
          <div className="relative size-72 overflow-hidden rounded-3xl border border-border/60 bg-muted/30">
            {objects.map((object) => (
              <StimulusObjectGlyph
                key={object.type}
                object={object}
                isReacting={phase === 'reacting' && tappedType === object.type}
              />
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="size-72" aria-hidden="true" />
      )}

      <div className="h-10">
        {phase === 'waiting' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-sm text-muted-foreground"
          >
            There&apos;s no right answer.
            <br />
            Just notice.
          </motion.p>
        )}
      </div>
    </MysteryLayout>
  )
}

function StimulusObjectGlyph({
  object,
  isReacting,
}: {
  object: StimulusObject
  isReacting: boolean
}): React.JSX.Element {
  const style = { top: `${object.topPercent}%`, left: `${object.leftPercent}%` }
  const reactionAnimate = isReacting ? { scale: [1, 1.12, 1] } : { scale: 1 }
  const reactionTransition = { duration: 0.45, ease: 'easeInOut' as const }

  const glow = isReacting && (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: [0, 0.6, 0], scale: [0.7, 1.5, 1.5] }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="bg-primary/30 absolute inset-0 -z-10 rounded-full blur-md"
    />
  )

  if (object.type === 'shape') {
    return (
      <motion.div
        data-object-type="shape"
        style={style}
        animate={reactionAnimate}
        transition={reactionTransition}
        className="absolute flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-foreground/10 text-foreground/70"
      >
        {glow}
        <Square className="size-7" aria-hidden="true" />
      </motion.div>
    )
  }

  if (object.type === 'color') {
    return (
      <motion.div
        data-object-type="color"
        style={style}
        animate={reactionAnimate}
        transition={reactionTransition}
        className="bg-primary/70 absolute size-12 -translate-x-1/2 -translate-y-1/2 rounded-full"
        aria-hidden="true"
      >
        {glow}
      </motion.div>
    )
  }

  return (
    <motion.div
      data-object-type="face"
      style={style}
      animate={reactionAnimate}
      transition={reactionTransition}
      className="absolute flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/10 text-foreground/70"
    >
      {glow}
      <Smile className="size-8" aria-hidden="true" />
    </motion.div>
  )
}
