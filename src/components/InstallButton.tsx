'use client'

import { useEffect, useState } from 'react'
import { Download, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// The beforeinstallprompt event isn't in TypeScript's built-in DOM lib
// (it's a Chromium-only extension, never standardized) — this is the
// real shape Chrome/Edge fire, not guessed.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isRunningStandalone(): boolean {
  const navigatorWithIOSFlag = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithIOSFlag.standalone === true
}

// Safari (iOS and iPadOS) never fires beforeinstallprompt — there is no
// programmatic install trigger there at all, only the manual Share ->
// Add to Home Screen path. iPadOS 13+ reports a desktop "Macintosh" user
// agent, so a real Mac is distinguished by the one thing no Mac has:
// touch points.
function isIOSDevice(): boolean {
  const isIPhoneOrIPod = /iPhone|iPod/.test(navigator.userAgent)
  const isIPad = /iPad/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
  return isIPhoneOrIPod || isIPad
}

// Universal Persistent PWA Install™ — real Android device testing found
// the previous "render nothing until the browser fires beforeinstallprompt"
// behavior meant most mobile visitors never saw an install option at
// all: Safari never fires it, and Chrome only fires it once its own
// engagement heuristics are met, which can be well after a user would
// have wanted to install. This button is now permanently visible on
// mobile (only hidden once the app is genuinely already installed and
// running standalone) — tapping it uses the real captured prompt when
// one exists, and otherwise opens a clear manual guide instead of doing
// nothing.
export function InstallButton(): React.JSX.Element | null {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    setIsInstalled(isRunningStandalone())
    setIsIOS(isIOSDevice())

    function handleBeforeInstallPrompt(event: Event): void {
      // Browsers show their own default install UI unless this is called —
      // suppressed so this button is the one real trigger point instead.
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    function handleAppInstalled(): void {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function handleClick(): Promise<void> {
    if (installPrompt !== null) {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      // A captured beforeinstallprompt event can only be used once —
      // spent either way, accepted or dismissed, matching the real
      // browser contract (a fresh event only fires again on a later
      // page load).
      if (choice.outcome === 'accepted') setIsInstalled(true)
      setInstallPrompt(null)
      return
    }

    // No native prompt available — iOS Safari (which never fires one) or
    // a browser/state where Chrome's own install heuristics haven't been
    // met yet. Either way, a real manual guide beats a silently missing
    // install path.
    setShowGuide(true)
  }

  if (isInstalled) return null

  return (
    <>
      {/* Mobile Viewport Fix™ — the label collapses to an icon-only button
          below `sm` (640px, the same breakpoint Topbar's own mobile/desktop
          split already uses elsewhere) so it can never push the header's
          theme-toggle/account cluster past the screen edge on a phone.
          aria-label keeps the accessible name intact either way. */}
      <Button variant="ghost" size="sm" className="gap-1.5" aria-label="Install app" onClick={() => void handleClick()}>
        <Download className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Install App</span>
      </Button>

      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Install Quantum Mind</DialogTitle>
            <DialogDescription>
              {isIOS
                ? 'Add Quantum Mind to your Home Screen for the full app experience.'
                : 'Add Quantum Mind to your device for quick, one-tap access.'}
            </DialogDescription>
          </DialogHeader>

          {isIOS ? (
            <ol className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-foreground">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary" aria-hidden="true">1</span>
                Tap the Share icon <Share className="mx-1 inline size-4 align-text-bottom" aria-hidden="true" /> in Safari&rsquo;s toolbar.
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary" aria-hidden="true">2</span>
                Scroll down and tap &ldquo;Add to Home Screen.&rdquo;
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary" aria-hidden="true">3</span>
                Tap &ldquo;Add&rdquo; to confirm.
              </li>
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">
              Open your browser menu and choose &ldquo;Install app&rdquo; or &ldquo;Add to Home screen.&rdquo; If you don&rsquo;t see that option yet, keep using Quantum Mind for a bit — most browsers unlock it after a couple of visits.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
