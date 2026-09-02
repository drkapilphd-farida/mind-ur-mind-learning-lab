// Free Guided Meditation™ — the low-barrier, "try before you commit"
// lead magnet on /retreats/online-11-day. Framed strictly as guided
// relaxation/breathing practice, not an energy-activation or
// ability-based claim — this is the most solid, uncontroversial ground
// for a no-signup, frictionless entry point.
//
// Audio `audioUrl` stays the literal "[AUDIO FILE NEEDED]" marker (not
// `undefined`) until real recordings are provided — FreeMeditationPlayer.tsx
// checks it with isRealUrl() before ever pointing a real <audio> element
// at it, so this placeholder never renders as a broken/erroring player.
// Swapping in a real URL here is the only change needed to make a track
// playable.
export type FreeMeditationAudioTrack = {
  id: string
  title: string
  durationLabel: string
  audioUrl: string
}

// The one real, live track — a real YouTube video (https://youtu.be/T6TDIz2Ockg,
// "20-Minute Guided Meditation for Instant Anxiety Relief and Stress
// Reduction" per its own YouTube title). Retitled/captioned here in
// neutral, experience-based language rather than that title's clinical
// framing ("Anxiety Relief") — see FreeMeditationPlayer.tsx and
// retreatLanding.freeMeditation.videoCaption in i18n.ts for why.
//
// Embedded via youtube-nocookie.com, not youtube.com — same video, same
// video ID, but this is the only YouTube embed domain next.config.ts's
// CSP frame-src allows (see reviewsPlaylist.ts for the same reasoning).
// A plain youtube.com/embed URL here would be silently blocked by the
// browser.
export const FREE_MEDITATION_VIDEO = {
  title: 'Guided Relaxation Practice',
  durationLabel: '~20 min',
  youtubeEmbedUrl: 'https://www.youtube-nocookie.com/embed/T6TDIz2Ockg',
}

export const FREE_MEDITATION_AUDIO_TRACKS: readonly FreeMeditationAudioTrack[] = [
  { id: 'evening-wind-down', title: 'Evening Wind-Down', durationLabel: '~12 min', audioUrl: '[AUDIO FILE NEEDED]' },
  { id: 'five-minute-reset', title: '5-Minute Reset', durationLabel: '~5 min', audioUrl: '[AUDIO FILE NEEDED]' },
]
