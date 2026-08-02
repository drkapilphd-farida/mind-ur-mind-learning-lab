'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { HERO_CARD_TAGS, MICRO_TRUST_MESSAGE, POWERED_BY_LINE, SUPPORTING_LINE, WHAT_HAPPENS_NEXT_CARDS } from '@/features/discovery-upload-bridge/copy'

// Discovery → Upload Bridge™ (ALS-14 Sprint-1). "The upload is not the
// beginning of the journey. It is simply the first real application of
// everything the AI has already learned about the user." One screen,
// one continuous premium reveal — never a multi-step journey with
// manual "Continue" taps like its Discovery siblings, since the brief's
// own Premium Motion is a single uninterrupted sequence ending at one
// real CTA. Reuses the real, already-built upload wizard at
// `/preview/learning-projects/new` unchanged — this screen builds no
// new upload mechanics of its own.
const PREVIEW_CARD_STEP_S = 0.1
const PREVIEW_CARDS_START_S = 0.85
const POWERED_BY_DELAY_S = PREVIEW_CARDS_START_S + WHAT_HAPPENS_NEXT_CARDS.length * PREVIEW_CARD_STEP_S + 0.15
const CTA_DELAY_S = POWERED_BY_DELAY_S + 0.2

export function DiscoveryUploadBridgeScreen(): React.JSX.Element {
  const router = useRouter()

  const goToUpload = (): void => router.push('/preview/learning-projects/new')

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-4 bg-background px-6 py-12 text-center">
      <LivingBrainLogo className="size-10 sm:size-12" />

      {/* SCREEN TITLE — fades upward as the Learning Profile moment ends. */}
      <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="mt-2 text-4xl" aria-hidden="true">
        🧠
      </motion.p>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }} className={TYPOGRAPHY.h1}>
        Your Learning Profile Is Ready
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
        className={cn(TYPOGRAPHY.body, 'text-muted-foreground')}
      >
        {SUPPORTING_LINE}
      </motion.p>

      {/* HERO CARD — a visual invitation; tapping it starts the same real
          upload flow as the primary CTA below. */}
      <motion.button
        type="button"
        onClick={goToUpload}
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
        className="mt-2 w-full rounded-2xl border border-border/60 bg-card p-6 text-left shadow-md transition-shadow hover:shadow-lg"
      >
        <p className="text-3xl" aria-hidden="true">
          📄
        </p>
        <p className={cn(TYPOGRAPHY.h3, 'mt-2')}>Upload Your First Document</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {HERO_CARD_TAGS.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </motion.button>

      {/* SECONDARY OPTION — no real sample-document experience exists
          yet, so this stays an honest, visibly inert "coming soon"
          rather than a fake working link. */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.55, ease: 'easeOut' }} className="flex flex-col items-center gap-1">
        <Button type="button" variant="ghost" size="sm" disabled className="text-muted-foreground">
          ✨ Explore with a Sample Document
        </Button>
        <p className={TYPOGRAPHY.caption}>Coming soon</p>
      </motion.div>

      {/* MICRO TRUST MESSAGE */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.7, ease: 'easeOut' }}
        className={cn(TYPOGRAPHY.caption, 'mt-1')}
      >
        {MICRO_TRUST_MESSAGE}
      </motion.p>

      {/* WHAT HAPPENS NEXT — elegant previews only, no descriptions. */}
      <div className="mt-4 grid w-full grid-cols-2 gap-3">
        {WHAT_HAPPENS_NEXT_CARDS.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: PREVIEW_CARDS_START_S + index * PREVIEW_CARD_STEP_S, ease: 'easeOut' }}
            className="rounded-xl border border-border/40 bg-card p-3"
          >
            <p className="text-xl" aria-hidden="true">
              {card.emoji}
            </p>
            <p className="mt-1 text-xs font-semibold text-foreground">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* BRAND POSITIONING — one unified system, never separate products. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: POWERED_BY_DELAY_S, ease: 'easeOut' }}
        className="mt-2 rounded-full bg-muted px-4 py-1.5"
      >
        <p className={TYPOGRAPHY.caption}>
          Powered by <span className="text-foreground">{POWERED_BY_LINE}</span>
        </p>
      </motion.div>

      {/* PRIMARY CTA — straight into the real, already-built upload
          wizard; no intermediate confirmation screen. */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: CTA_DELAY_S, ease: 'easeOut' }} className="mt-4 w-full">
        <Button size="lg" className="min-h-14 w-full rounded-full text-base font-semibold" onClick={goToUpload}>
          📄 Upload My First Document
        </Button>
      </motion.div>
    </main>
  )
}
