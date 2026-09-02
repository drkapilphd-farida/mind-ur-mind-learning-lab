"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import { isRealUrl } from "@/lib/isRealUrl";
import { FREE_MEDITATION_VIDEO, FREE_MEDITATION_AUDIO_TRACKS } from "@/config/freeMeditationTracks";
import { WHATSAPP_RETREAT_INQUIRY_LINK } from "@/config/whatsappSupportLink";

// Free Guided Meditation™ — low-barrier, no-signup lead magnet. One real,
// live track (a real YouTube embed — no autoplay param, so it never
// plays on page load) plus two short audio tracks still pending real
// recordings. Framed deliberately as relaxation/experience-based
// language, never an energy-activation or mechanism claim (see
// videoCaption in i18n.ts) — this is the free, no-barrier entry point
// and should sit on the most uncontroversial ground, even though the
// retreat's own paid-program copy elsewhere on this page uses richer
// spiritual/energy language.
//
// Plain HTML5 <audio> per audio track, controlled via refs — no player
// library needed for two tracks with a simple play/pause toggle. Only
// one audio track plays at a time. Tracks whose audioUrl isn't a real
// URL yet (see freeMeditationTracks.ts) render as a clearly labeled,
// disabled "Coming Soon" row rather than a broken player.
export default function FreeMeditationPlayer(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.retreatLanding.freeMeditation;
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  function togglePlay(trackId: string): void {
    const audio = audioRefs.current[trackId];
    if (!audio) return;

    if (playingId === trackId) {
      audio.pause();
      setPlayingId(null);
      return;
    }

    const currentlyPlaying = playingId !== null ? audioRefs.current[playingId] : null;
    currentlyPlaying?.pause();
    audio.currentTime = 0;
    void audio.play();
    setPlayingId(trackId);
  }

  return (
    <section id="free-meditation" className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <div className="flex justify-center">
            <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          </div>
          <h2 className="mt-4 text-[26px] font-extrabold leading-tight sm:text-[32px]">{section.title}</h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-ink-dim">{section.desc}</p>
        </div>

        <div className="rounded-sm border border-line-strong bg-panel2 p-5">
          <div className="aspect-video w-full overflow-hidden rounded-sm border border-line-strong">
            <iframe
              src={FREE_MEDITATION_VIDEO.youtubeEmbedUrl}
              title={FREE_MEDITATION_VIDEO.title}
              className="h-full w-full"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-[14.5px] font-semibold text-ink">{FREE_MEDITATION_VIDEO.title}</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.05em] text-ink-faint">
              {FREE_MEDITATION_VIDEO.durationLabel}
            </div>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-dim">{section.videoCaption}</p>
        </div>

        <div className="mt-3 space-y-3">
          {FREE_MEDITATION_AUDIO_TRACKS.map((track) => {
            const playable = isRealUrl(track.audioUrl);
            const isPlaying = playingId === track.id;
            return (
              <div
                key={track.id}
                className={`flex items-center gap-4 rounded-sm border border-line-strong bg-panel2 px-5 py-4 ${
                  playable ? "" : "opacity-60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => togglePlay(track.id)}
                  disabled={!playable}
                  aria-label={isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-teal/50 bg-teal-soft text-teal transition-colors hover:bg-teal-soft/70 disabled:cursor-not-allowed"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="text-[14.5px] font-semibold text-ink">{track.title}</div>
                  <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.05em] text-ink-faint">
                    {playable ? track.durationLabel : section.comingSoonLabel}
                  </div>
                </div>
                {isPlaying && (
                  <span
                    className="h-2 w-2 flex-none animate-pulse rounded-full bg-teal motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                )}
                {playable && (
                  <audio
                    ref={(el) => {
                      audioRefs.current[track.id] = el;
                    }}
                    src={track.audioUrl}
                    preload="none"
                    onEnded={() => setPlayingId(null)}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[12.5px] text-ink-faint">{section.noSignupNote}</p>
          <a
            href={WHATSAPP_RETREAT_INQUIRY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-block text-[12.5px] font-semibold text-teal underline decoration-teal/40 underline-offset-2 hover:text-teal-light"
          >
            {section.downloadPrompt} {section.downloadCtaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
