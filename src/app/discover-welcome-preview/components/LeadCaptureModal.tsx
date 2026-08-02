'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, PartyPopper } from 'lucide-react'
import type { z } from 'zod'
import { cn } from '@/lib/utils'
import { submitLead } from '../actions/submitLead'
import { LeadCaptureInputSchema } from '../actions/leadCaptureSchema'

const LeadCaptureFormSchema = LeadCaptureInputSchema.pick({ fullName: true, whatsappNumber: true })
type LeadCaptureFormValues = z.infer<typeof LeadCaptureFormSchema>

const SUCCESS_HANDOFF_DELAY_MS = 1400

export type LeadCaptureResult = {
  fullName: string
  whatsappNumber: string
  readingWpm: number
  memoryPercent: number
  focusPercent: number
}

type LeadCaptureModalProps = {
  readingWpm: number
  memoryPercent: number
  focusPercent: number
  onSuccess: (result: LeadCaptureResult) => void
}

type Phase = 'form' | 'success'

// Final step of the 2-minute assessment lead magnet — captures Full
// Name + WhatsApp Number, saves them alongside the three already-earned
// scores via the submitLead Server Action, then hands off to the Mind
// Profile Dashboard. Presentational otherwise: the only side effect it
// owns is calling `onSuccess` once, after a brief "unlocked" moment.
export function LeadCaptureModal({ readingWpm, memoryPercent, focusPercent, onSuccess }: LeadCaptureModalProps): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>('form')
  const [serverError, setServerError] = useState<string | null>(null)
  const [submittedValues, setSubmittedValues] = useState<LeadCaptureFormValues | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadCaptureFormValues>({
    resolver: zodResolver(LeadCaptureFormSchema),
    defaultValues: { fullName: '', whatsappNumber: '' },
  })

  const isMountedRef = useRef(true)
  const hasFiredOnSuccessRef = useRef(false)

  useEffect(() => {
    // Reset to true on every effect-mount rather than trusting the
    // initial useRef value alone — React Strict Mode's dev-only
    // double-invoke (mount → cleanup → mount again) would otherwise
    // leave this permanently false after the simulated first cleanup.
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (phase !== 'success' || submittedValues === null) return
    const timeout = setTimeout(() => {
      if (!isMountedRef.current || hasFiredOnSuccessRef.current) return
      hasFiredOnSuccessRef.current = true
      onSuccess({
        fullName: submittedValues.fullName,
        whatsappNumber: submittedValues.whatsappNumber,
        readingWpm,
        memoryPercent,
        focusPercent,
      })
    }, SUCCESS_HANDOFF_DELAY_MS)
    return () => clearTimeout(timeout)
  }, [phase, submittedValues, onSuccess, readingWpm, memoryPercent, focusPercent])

  async function onSubmit(values: LeadCaptureFormValues): Promise<void> {
    setServerError(null)
    const result = await submitLead({
      fullName: values.fullName,
      whatsappNumber: values.whatsappNumber,
      readingWpm,
      memoryPercent,
      focusPercent,
    })

    if (!result.success) {
      setServerError(result.error)
      return
    }

    setSubmittedValues(values)
    setPhase('success')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/60 p-8 shadow-xl backdrop-blur-sm sm:p-10">
        <AnimatePresence mode="wait">
          {phase === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-2xl">
                  🎉
                </div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Your Mind Profile is Ready!</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your details to unlock your full Reading, Memory &amp; Focus report and custom 21-day roadmap.
                </p>
              </div>

              <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} noValidate className="mt-8 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fullName" className="text-xs font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    {...register('fullName')}
                    className={cn(
                      'rounded-xl border-2 bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors duration-200',
                      'focus:border-primary/50',
                      errors.fullName ? 'border-red-500' : 'border-border',
                    )}
                  />
                  {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="whatsappNumber" className="text-xs font-medium text-muted-foreground">
                    WhatsApp Number
                  </label>
                  <input
                    id="whatsappNumber"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Enter your WhatsApp number"
                    {...register('whatsappNumber')}
                    className={cn(
                      'rounded-xl border-2 bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors duration-200',
                      'focus:border-primary/50',
                      errors.whatsappNumber ? 'border-red-500' : 'border-border',
                    )}
                  />
                  {errors.whatsappNumber && <p className="text-xs text-red-500">{errors.whatsappNumber.message}</p>}
                </div>

                {serverError !== null && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600">{serverError}</p>}

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  {...(isSubmitting ? {} : { whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 } })}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className={cn(
                    'mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4',
                    'text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25',
                    'transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-70',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Unlocking...
                    </>
                  ) : (
                    'Unlock My Mind Profile 🚀'
                  )}
                </motion.button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">🔒 No spam. Your data is 100% secure with us.</p>
            </motion.div>
          )}

          {phase === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex flex-col items-center gap-4 py-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"
              >
                <PartyPopper className="size-8" aria-hidden="true" />
              </motion.div>
              <h2 className="font-heading text-xl font-bold text-foreground">Profile Unlocked!</h2>
              <p className="text-sm text-muted-foreground">Preparing your Comprehensive Mind Profile...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
