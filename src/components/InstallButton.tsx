'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

// The beforeinstallprompt event isn't in TypeScript's built-in DOM lib
// (it's a Chromium-only extension, never standardized) — this is the
// real shape Chrome/Edge fire, not guessed.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

// PWA 1-Click Install™ — renders nothing until the browser itself decides
// this page is installable and fires beforeinstallprompt (Chrome/Edge/
// most Android browsers; Firefox and Safari never fire this event at
// all, so the button simply never appears there — no dead/no-op button
// shown to those users). Also disappears permanently once actually
// installed (the `appinstalled` event), rather than staying visible for
// a state that no longer applies.
export function InstallButton(): React.JSX.Element | null {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
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

  async function handleInstall(): Promise<void> {
    if (installPrompt === null) return
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    // A captured beforeinstallprompt event can only be used once — spent
    // either way, accepted or dismissed, matching the real browser
    // contract (a fresh event only fires again on a later page load).
    if (choice.outcome === 'accepted') setIsInstalled(true)
    setInstallPrompt(null)
  }

  if (installPrompt === null || isInstalled) return null

  return (
    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => void handleInstall()}>
      <Download className="size-4" aria-hidden="true" />
      Install App
    </Button>
  )
}
