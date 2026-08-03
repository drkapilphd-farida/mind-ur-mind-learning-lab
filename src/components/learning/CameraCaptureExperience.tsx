'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type CameraState = 'idle' | 'requesting' | 'live' | 'captured' | 'permission-denied' | 'unsupported'

type CameraCaptureExperienceProps = {
  onCapture: (file: File) => void
}

// Universal Upload Experience™ (Sprint LW-1C.2) — real camera capture
// (getUserMedia + <video> live preview + <canvas> snapshot), directly
// mirroring the honest-degradation state machine already established for
// Record & Learn™'s audio capture (RecordAndLearnExperience.tsx) — same
// shape (idle/requesting/permission-denied/unsupported), not duplicated,
// its *pattern* reused. The captured photo becomes a real File (canvas
// toBlob), handed to the caller — which feeds it into the exact same
// image-submission path as a regular image upload, so "everything enters
// the SAME AI Pipeline" by construction, not by convention.
export function CameraCaptureExperience({ onCapture }: CameraCaptureExperienceProps): React.JSX.Element {
  const [state, setState] = useState<CameraState>('idle')
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const capturedBlobRef = useRef<Blob | null>(null)

  const stopStream = useCallback((): void => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  // Release the camera if the user navigates away mid-capture.
  useEffect(() => stopStream, [stopStream])

  useEffect(() => {
    return () => {
      if (capturedUrl) URL.revokeObjectURL(capturedUrl)
    }
  }, [capturedUrl])

  useEffect(() => {
    if (state === 'live' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      void videoRef.current.play()
    }
  }, [state])

  async function handleStart(): Promise<void> {
    if (typeof navigator === 'undefined' || navigator.mediaDevices?.getUserMedia === undefined) {
      setState('unsupported')
      return
    }
    setState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setState('live')
    } catch {
      setState('permission-denied')
    }
  }

  function handleTakePhoto(): void {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        capturedBlobRef.current = blob
        setCapturedUrl(URL.createObjectURL(blob))
        stopStream()
        setState('captured')
      },
      'image/jpeg',
      0.92,
    )
  }

  function handleRetake(): void {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl)
    setCapturedUrl(null)
    capturedBlobRef.current = null
    void handleStart()
  }

  function handleUsePhoto(): void {
    if (!capturedBlobRef.current) return
    onCapture(new File([capturedBlobRef.current], `camera-scan-${Date.now()}.jpg`, { type: 'image/jpeg' }))
  }

  const statusAnnouncement = state === 'live' ? 'Camera ready.' : state === 'captured' ? 'Photo captured.' : state === 'permission-denied' ? 'Camera access was not granted.' : ''

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="sr-only" role="status" aria-live="polite">
        {statusAnnouncement}
      </p>

      {(state === 'idle' || state === 'requesting') && (
        <>
          <div className="flex size-28 items-center justify-center rounded-full border border-border bg-background/60 backdrop-blur-sm">
            <Camera className="size-10 text-foreground/70" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <p className={cn(TYPOGRAPHY.body, 'text-muted-foreground')}>Take a photo and start learning instantly.</p>
          <Button size="lg" className="rounded-full px-8" onClick={() => void handleStart()} disabled={state === 'requesting'}>
            {state === 'requesting' ? 'Waiting for camera…' : (
              <>
                Take Photo <span aria-hidden="true">→</span>
              </>
            )}
          </Button>
        </>
      )}

      {state === 'live' && (
        <>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-black">
            <video ref={videoRef} muted playsInline className="aspect-square w-full object-cover" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <Button size="lg" className="rounded-full px-8" onClick={handleTakePhoto}>
            Take Photo
          </Button>
        </>
      )}

      {state === 'captured' && capturedUrl && (
        <>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element -- a real, local, temporary object URL preview of the just-captured photo. */}
            <img src={capturedUrl} alt="Your captured photo" className="aspect-square w-full object-cover" />
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" className="rounded-full" onClick={handleRetake}>
              Retake
            </Button>
            <Button type="button" className="rounded-full px-8" onClick={handleUsePhoto}>
              Use Photo <span aria-hidden="true">→</span>
            </Button>
          </div>
        </>
      )}

      {state === 'permission-denied' && (
        <>
          <p className={cn(TYPOGRAPHY.body, 'max-w-xs text-muted-foreground')}>
            Quantum Mind needs camera access to scan a page. Check your browser&rsquo;s permission settings and try again.
          </p>
          <Button size="lg" className="rounded-full px-8" onClick={() => void handleStart()}>
            Try Again
          </Button>
        </>
      )}

      {state === 'unsupported' && (
        <p className={cn(TYPOGRAPHY.body, 'max-w-xs text-muted-foreground')}>
          Camera capture isn&rsquo;t available in this browser. Try Notes &amp; Images instead to upload a photo you&rsquo;ve already taken.
        </p>
      )}
    </div>
  )
}
