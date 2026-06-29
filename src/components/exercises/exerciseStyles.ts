// Shared typography/spacing rhythm for every exercise screen. Intro is the
// hero moment (larger title); completion is deliberately quieter — that
// contrast is intentional and should stay consistent across every exercise.
export const EXERCISE_SCREEN_CLASSNAME =
  'animate-in fade-in flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16 text-center duration-700'

export const EXERCISE_TITLE_CLASSNAME =
  'text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'

export const EXERCISE_QUIET_TITLE_CLASSNAME =
  'text-2xl font-semibold tracking-tight text-foreground sm:text-3xl'

export const EXERCISE_BODY_CLASSNAME = 'text-base leading-7 text-muted-foreground'

export const EXERCISE_CAPTION_CLASSNAME = 'text-sm leading-6 text-muted-foreground'

// The one reduced-motion explanation every exercise with continuous or
// glide motion shows — written once so it's never retyped per exercise.
export const REDUCED_MOTION_CAPTION = 'Reduced motion is on — follow the soft pulse and let your eyes rest.'
