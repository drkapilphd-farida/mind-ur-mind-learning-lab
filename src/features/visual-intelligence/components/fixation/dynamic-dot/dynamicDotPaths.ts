// Visual Intelligence Lab™ — Visual Fixation Engine™, Sprint 5.
// The 6 Dynamic Dot™ pursuit paths, expressed as raw CSS @keyframes text so
// DynamicDotSession.tsx can inject one small <style> block and simply pick
// an animationName per path — no animation library dependency.

import type { FixationLevelOption } from '../../../fixation/fixationLevels'

const DISTANCE_PX = 90

export type DynamicDotPathValue = FixationLevelOption['value']

type DynamicDotPathDefinition = {
  keyframeName: string
  keyframesCss: string
  durationMs: number
  timingFunction: string
}

export const DYNAMIC_DOT_PATH_DEFINITIONS: Record<string, DynamicDotPathDefinition> = {
  left: {
    keyframeName: 'fixation-dot-path-left',
    keyframesCss: `@keyframes fixation-dot-path-left { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-${DISTANCE_PX}px, 0); } }`,
    durationMs: 3000,
    timingFunction: 'ease-in-out',
  },
  right: {
    keyframeName: 'fixation-dot-path-right',
    keyframesCss: `@keyframes fixation-dot-path-right { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(${DISTANCE_PX}px, 0); } }`,
    durationMs: 3000,
    timingFunction: 'ease-in-out',
  },
  up: {
    keyframeName: 'fixation-dot-path-up',
    keyframesCss: `@keyframes fixation-dot-path-up { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(0, -${DISTANCE_PX}px); } }`,
    durationMs: 3000,
    timingFunction: 'ease-in-out',
  },
  down: {
    keyframeName: 'fixation-dot-path-down',
    keyframesCss: `@keyframes fixation-dot-path-down { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(0, ${DISTANCE_PX}px); } }`,
    durationMs: 3000,
    timingFunction: 'ease-in-out',
  },
  diagonal: {
    keyframeName: 'fixation-dot-path-diagonal',
    keyframesCss: `@keyframes fixation-dot-path-diagonal { 0% { transform: translate(-${DISTANCE_PX * 0.75}px, -${DISTANCE_PX * 0.75}px); } 50% { transform: translate(${DISTANCE_PX * 0.75}px, ${DISTANCE_PX * 0.75}px); } 100% { transform: translate(-${DISTANCE_PX * 0.75}px, -${DISTANCE_PX * 0.75}px); } }`,
    durationMs: 3600,
    timingFunction: 'ease-in-out',
  },
  circle: {
    keyframeName: 'fixation-dot-path-circle',
    keyframesCss: `@keyframes fixation-dot-path-circle { 0% { transform: translate(${DISTANCE_PX}px, 0); } 25% { transform: translate(0, ${DISTANCE_PX}px); } 50% { transform: translate(-${DISTANCE_PX}px, 0); } 75% { transform: translate(0, -${DISTANCE_PX}px); } 100% { transform: translate(${DISTANCE_PX}px, 0); } }`,
    durationMs: 4800,
    timingFunction: 'linear',
  },
}

export const ALL_DYNAMIC_DOT_KEYFRAMES_CSS = Object.values(DYNAMIC_DOT_PATH_DEFINITIONS)
  .map((definition) => definition.keyframesCss)
  .join('\n')
