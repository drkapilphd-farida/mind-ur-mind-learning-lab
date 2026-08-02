'use client'

import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'

// Day 21 Completion Certificate™ — a deliberate, well-justified exception
// to this app's own "no confetti" house style (see MicroVictoryMoment.tsx,
// ReadingIntelligenceActivatedCard.tsx's explicit "no confetti" comments):
// those are about routine, frequent moments (a single exercise, a daily
// session) where celebration noise would get old fast. Finishing all 21
// real days of the journey is a genuine once-per-user finale, not a
// routine event, so a real (if brief and tasteful) confetti burst earns
// its place here specifically. Hand-rolled on a plain <canvas> — no new
// dependency, matching this project's existing "hand-craft visual
// effects rather than install a library" convention (LivingBrainLogo,
// the analytics charts).
const PARTICLE_COLORS = ['#2B4CE8', '#0FD9A0', '#F59E0B', '#EF4444', '#8B5CF6'] as const
const PARTICLE_COUNT = 120
const DURATION_MS = 3200
const GRAVITY = 0.12

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  size: number
  color: string
}

function createParticles(width: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * width,
    y: -20 - Math.random() * 200,
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 3,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 12,
    size: 6 + Math.random() * 6,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]!,
  }))
}

export function ConfettiBurst(): React.JSX.Element | null {
  const prefersReducedMotion = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (prefersReducedMotion) return undefined
    const canvas = canvasRef.current
    if (canvas === null) return undefined
    const ctx = canvas.getContext('2d')
    if (ctx === null) return undefined

    function resize(): void {
      if (canvas === null) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = createParticles(canvas.width)
    const startedAt = Date.now()
    let animationFrameId: number

    function tick(): void {
      if (ctx === null || canvas === null) return
      const elapsed = Date.now() - startedAt
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (elapsed > DURATION_MS) return

      for (const particle of particles) {
        particle.vy += GRAVITY * 0.1
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rotation += particle.rotationSpeed

        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate((particle.rotation * Math.PI) / 180)
        ctx.fillStyle = particle.color
        ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2)
        ctx.restore()
      }

      animationFrameId = requestAnimationFrame(tick)
    }
    animationFrameId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [prefersReducedMotion])

  if (prefersReducedMotion) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  )
}
