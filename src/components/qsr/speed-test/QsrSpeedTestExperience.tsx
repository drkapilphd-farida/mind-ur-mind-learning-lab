"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Play, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";
import { Eyebrow } from "../../ui";
import QsrGuaranteeBadge from "../QsrGuaranteeBadge";
import { computeLiveWpm } from "@/features/quantum-speed-reading/readingSessionEngine";
import { splitWordAtOrp } from "@/features/quantum-journey/readingModes/pacingMath";
import { buildProgressiveChunks, computeRampWpm, RAMP_START_WPM } from "./speedDemoPacing";
import { pickRandomPassagePair } from "./speedTestPassagePool";
import {
  SPEED_TEST_PERSONAS,
  PERSONA_INSIGHT_COPY,
  type SpeedTestPassage,
  type SpeedTestPersonaId,
} from "./speedTestContent";

// Reading Speed Test™ — a free lead-magnet tool, NOT the paid program.
// Every stage's copy is written to keep that distinction explicit (see
// results CTA below). English-only for v1 — unlike the rest of this
// bilingual site, translating a live-timed interactive passage/quiz
// flow into Hindi is a real, separate content effort, not a copy swap;
// flagged here rather than silently skipped.
//
// Real-engine wiring: WPM math uses computeLiveWpm() from the actual
// Reading Session Engine (readingSessionEngine.ts) — the same formula
// every real drill in the app uses. The auto-accelerating speed-ramp in
// the "Experience It" stage has no real-product equivalent to borrow:
// real drills are either fully self-paced (the actual Reading Assessment
// flow) or run at a fixed, configured WPM, never an auto-ramping preview
// — so that ramp curve (speedDemoPacing.ts, 220 → 560 WPM) stays this
// component's own, self-contained logic. ORP pivot-letter highlighting
// reuses the real, shipped implementation from the 21-day journey's
// Advanced RSVP Mode (pacingMath.ts's splitWordAtOrp) rather than
// reinventing the heuristic here.
//
// Passage pool: a real, distinct random passage pair (calibration +
// demo) is picked from speedTestPassagePool.ts's 24-passage pool on
// every session — picked client-side only inside a useEffect, never
// during the initial render, because picking during SSR would render
// one random pair on the server and a different one on the client, a
// real hydration mismatch (same reasoning RsvpModePlayer.tsx documents
// for the same pattern).

const STAGE_LABELS = ["Calibrate", "Comprehend", "Experience", "Results"] as const;

type Stage = "intro" | "calibration" | "calibrationQuiz" | "preDemo" | "speedDemo" | "speedQuiz" | "results";

function stageIndex(stage: Stage): number {
  if (stage === "calibration" || stage === "calibrationQuiz") return 0;
  if (stage === "speedDemo") return 2;
  if (stage === "speedQuiz") return 1;
  if (stage === "results") return 3;
  return -1;
}

export default function QsrSpeedTestExperience(): React.JSX.Element {
  const [stage, setStage] = useState<Stage>("intro");
  const [persona, setPersona] = useState<SpeedTestPersonaId | null>(null);

  // Client-only pick — see the hydration-mismatch note above.
  const [passagePair, setPassagePair] = useState<[SpeedTestPassage, SpeedTestPassage] | null>(null);
  useEffect(() => {
    setPassagePair(pickRandomPassagePair());
  }, []);
  const calibrationPassage = passagePair?.[0] ?? null;
  const demoPassage = passagePair?.[1] ?? null;

  const calibStartRef = useRef<number | null>(null);
  const [baselineWpm, setBaselineWpm] = useState<number | null>(null);
  const [calibAnswers, setCalibAnswers] = useState<[number | null, number | null]>([null, null]);

  const demoChunks = useMemo(() => {
    if (demoPassage === null) return [];
    return buildProgressiveChunks(demoPassage.text.trim().split(/\s+/).filter(Boolean));
  }, [demoPassage]);
  const [chunkIndex, setChunkIndex] = useState(-1);
  const [liveWpm, setLiveWpm] = useState(RAMP_START_WPM);
  const [demoAvgWpm, setDemoAvgWpm] = useState<number | null>(null);
  const demoStartRef = useRef<number | null>(null);
  const [demoAnswers, setDemoAnswers] = useState<[number | null, number | null]>([null, null]);

  function reset(): void {
    setStage("intro");
    setPersona(null);
    setPassagePair(pickRandomPassagePair());
    setBaselineWpm(null);
    setCalibAnswers([null, null]);
    setChunkIndex(-1);
    setLiveWpm(RAMP_START_WPM);
    setDemoAvgWpm(null);
    setDemoAnswers([null, null]);
  }

  function startCalibration(): void {
    calibStartRef.current = performance.now();
    setStage("calibration");
  }

  function finishCalibration(): void {
    const startedAt = calibStartRef.current;
    if (startedAt === null || calibrationPassage === null) return;
    const elapsedMs = performance.now() - startedAt;
    const wordCount = calibrationPassage.text.trim().split(/\s+/).filter(Boolean).length;
    setBaselineWpm(computeLiveWpm(wordCount, elapsedMs));
    setStage("calibrationQuiz");
  }

  function startDemo(): void {
    setStage("speedDemo");
    setChunkIndex(0);
    demoStartRef.current = performance.now();
  }

  useEffect(() => {
    if (stage !== "speedDemo") return undefined;
    if (chunkIndex < 0 || chunkIndex >= demoChunks.length) return undefined;

    const speed = computeRampWpm(chunkIndex, demoChunks.length);
    setLiveWpm(speed);

    const chunk = demoChunks[chunkIndex];
    const wordsInChunk = chunk !== undefined ? chunk.split(" ").length : 1;
    const delayMs = (wordsInChunk / speed) * 60_000;

    const timer = setTimeout(() => {
      const startedAt = demoStartRef.current;
      if (chunkIndex + 1 >= demoChunks.length) {
        if (startedAt !== null && demoPassage !== null) {
          const elapsedMs = performance.now() - startedAt;
          const wordCount = demoPassage.text.trim().split(/\s+/).filter(Boolean).length;
          setDemoAvgWpm(computeLiveWpm(wordCount, elapsedMs));
        }
        setStage("speedQuiz");
      } else {
        setChunkIndex((index) => index + 1);
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [stage, chunkIndex, demoChunks, demoPassage]);

  const baselineScore =
    calibrationPassage === null
      ? 0
      : calibAnswers.filter((answer, index) => answer === calibrationPassage.questions[index]?.correctIndex).length;
  const demoScore =
    demoPassage === null
      ? 0
      : demoAnswers.filter((answer, index) => answer === demoPassage.questions[index]?.correctIndex).length;
  const insightCopy = persona !== null ? PERSONA_INSIGHT_COPY[persona] : PERSONA_INSIGHT_COPY.default;

  const currentStageIndex = stageIndex(stage);

  return (
    <section className="border-b border-line px-6 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto w-full max-w-xl rounded-sm border border-line-strong bg-panel2 p-8 sm:p-10">
        {currentStageIndex >= 0 && (
          <div className="mb-8 flex flex-wrap gap-x-5 gap-y-2">
            {STAGE_LABELS.map((label, index) => {
              const state = index < currentStageIndex ? "done" : index === currentStageIndex ? "active" : "pending";
              return (
                <div
                  key={label}
                  className={`flex items-center gap-1.5 text-[12px] ${
                    state === "active" ? "font-semibold text-ink" : state === "done" ? "text-teal" : "text-ink-faint"
                  }`}
                >
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full border border-current text-[10px]">
                    {state === "done" ? <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> : index + 1}
                  </span>
                  {label}
                </div>
              );
            })}
          </div>
        )}

        {stage === "intro" && (
          <>
            <Eyebrow color="text-gold">Free · 2 Minutes</Eyebrow>
            <h1 className="mt-4 font-display text-[28px] italic leading-tight text-ink sm:text-[34px]">
              What&rsquo;s your actual reading speed?
            </h1>
            <p className="mt-4 text-[15.5px] leading-relaxed text-ink-dim">
              Read a short passage at your normal pace, answer a couple of questions, then feel what a trained pace is
              actually like. Real numbers, measured live — not a guess.
            </p>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">Optional — who&rsquo;s this test for?</p>
            <div className="mt-3 flex flex-col gap-2">
              {SPEED_TEST_PERSONAS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPersona(option.id)}
                  className={`rounded-sm border px-4 py-3 text-left text-[14px] transition-colors ${
                    persona === option.id ? "border-gold bg-gold-soft font-semibold text-ink" : "border-line-strong text-ink hover:border-gold/60"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={startCalibration}
              disabled={passagePair === null}
              className="mt-7 inline-flex items-center gap-2 rounded-sm bg-gold px-7 py-[15px] text-[14.5px] font-semibold text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <Play className="h-4 w-4" aria-hidden="true" /> Start the Test
            </button>
          </>
        )}

        {stage === "calibration" && calibrationPassage !== null && (
          <>
            <h1 className="text-[21px] font-bold text-ink">Read this at your normal pace</h1>
            <div className="mt-3 flex items-center gap-2 text-[12.5px] text-gold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-gold motion-reduce:animate-none" aria-hidden="true" />
              timing your actual pace
            </div>
            <div className="mt-4 rounded-sm border border-line-strong bg-panel px-6 py-5 text-[16px] leading-relaxed text-ink">
              {calibrationPassage.text}
            </div>
            <button
              type="button"
              onClick={finishCalibration}
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-gold px-7 py-[15px] text-[14.5px] font-semibold text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
            >
              I&rsquo;ve Finished Reading <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        )}

        {stage === "calibrationQuiz" && calibrationPassage !== null && (
          <QuizStage
            passage={calibrationPassage}
            answers={calibAnswers}
            onAnswer={(index, optionIndex) =>
              setCalibAnswers((prev) => {
                const next: [number | null, number | null] = [...prev];
                next[index] = optionIndex;
                return next;
              })
            }
            onContinue={() => setStage("preDemo")}
            continueLabel="Continue"
          />
        )}

        {stage === "preDemo" && (
          <>
            <h1 className="font-display text-[26px] italic text-ink sm:text-[30px]">Your baseline: {baselineWpm} WPM</h1>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-dim">
              Now let&rsquo;s show you what a trained pace actually feels like. Words will appear on their own, starting
              slow and speeding up into short phrases. Just let your eyes rest on the center — don&rsquo;t chase the words.
            </p>
            <button
              type="button"
              onClick={startDemo}
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-gold px-7 py-[15px] text-[14.5px] font-semibold text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
            >
              <Play className="h-4 w-4" aria-hidden="true" /> Experience It
            </button>
          </>
        )}

        {stage === "speedDemo" && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12.5px] text-ink-faint">Eyes still, let it come to you</span>
              <span className="font-display text-[14px] font-semibold text-gold">{liveWpm} WPM</span>
            </div>
            <div className="flex h-[220px] items-center justify-center overflow-hidden rounded-sm bg-[#1B1508] px-6">
              {chunkIndex >= 0 && demoChunks[chunkIndex] !== undefined && <FlashChunk chunk={demoChunks[chunkIndex] as string} />}
            </div>
          </>
        )}

        {stage === "speedQuiz" && demoPassage !== null && (
          <QuizStage
            passage={demoPassage}
            answers={demoAnswers}
            onAnswer={(index, optionIndex) =>
              setDemoAnswers((prev) => {
                const next: [number | null, number | null] = [...prev];
                next[index] = optionIndex;
                return next;
              })
            }
            onContinue={() => setStage("results")}
            continueLabel="See My Results"
          />
        )}

        {stage === "results" && (
          <>
            <Eyebrow color="text-gold">Your Results</Eyebrow>
            <h1 className="mt-4 font-display text-[26px] italic text-ink sm:text-[30px]">Here&rsquo;s where you stand today</h1>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <div className="rounded-sm border border-line-strong bg-panel px-5 py-5">
                <div className="font-display text-[44px] font-bold leading-none text-ink sm:text-[52px]">{baselineWpm}</div>
                <p className="mt-2.5 text-[12.5px] text-ink-faint">
                  Your baseline WPM · {Math.round((baselineScore / 2) * 100)}% comprehension
                </p>
              </div>
              <div className="rounded-sm border border-gold/40 bg-gold-soft/40 px-5 py-5">
                <div className="font-display text-[44px] font-bold leading-none text-ink sm:text-[52px]">{demoAvgWpm}</div>
                <p className="mt-2.5 text-[12.5px] text-ink-faint">
                  Trained-pace preview · {Math.round((demoScore / 2) * 100)}% comprehension at that speed
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-4">
              <ComparisonBar label="You, today" value={`${baselineWpm} WPM`} percent={Math.min(((baselineWpm ?? 0) / 600) * 100, 100)} tone="gold" emphasize />
              <ComparisonBar label="Average untrained reader" value="~230 WPM" percent={38} tone="faint" />
              <ComparisonBar label="Trained QSR target" value="550–600 WPM" percent={96} tone="teal" />
            </div>

            <div className="mt-6 rounded-r-sm border-l-[3px] border-gold bg-gold-soft px-4 py-3.5 text-[14px] leading-relaxed text-ink">
              {demoScore < 2 ? (
                <>
                  Notice your comprehension dipped once the pace picked up — that gap between <em>speed</em> and{" "}
                  <em>understanding</em> is exactly what structured training closes. Right now you&rsquo;re reading fast{" "}
                  <strong>or</strong> retaining it. The program trains both together.
                </>
              ) : (
                <>
                  You held onto comprehension even as the pace increased — that&rsquo;s a good sign for how quickly you could
                  adapt with structured training.
                </>
              )}{" "}
              {insightCopy}
            </div>

            <div className="mt-8 border-t border-line-strong pt-6">
              <Link
                href="/programs/quantum-speed-reading#pricing"
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-gold px-7 py-4 text-[15px] font-semibold text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
              >
                See the 30-Day Masterclass <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <QsrGuaranteeBadge className="mt-4" />
            </div>

            <button
              type="button"
              onClick={reset}
              className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-teal transition-colors hover:text-teal-light"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Take It Again
            </button>
          </>
        )}
      </div>
    </section>
  );
}

// Fixation anchor via CSS grid: the pivot letter sits in the grid's own
// (fixed) center column, so its screen position never shifts regardless
// of how long "before"/"after + rest of phrase" are — a stronger
// guarantee than a min-width heuristic once phrase chunks (not just
// single words) are in play. Sans-serif (this scope's --font-sans is
// Inter, see globals.css) instead of the page's Fraunces display face —
// serifs are harder to parse at high flash speed.
function FlashChunk({ chunk }: { chunk: string }): React.JSX.Element {
  const words = chunk.split(" ");
  const pivotWord = words[0] ?? "";
  const restWords = words.slice(1);
  const { before, orpChar, after } = splitWordAtOrp(pivotWord);

  return (
    <div className="grid w-full grid-cols-[1fr_auto_1fr] items-baseline font-sans text-[clamp(2rem,5vw,2.75rem)] font-semibold tracking-wide text-[#F5F0E6] transition-opacity duration-75 motion-reduce:transition-none">
      <span className="justify-self-end whitespace-pre">{before}</span>
      <span className="justify-self-center text-[1.15em] font-bold text-gold">{orpChar}</span>
      <span className="justify-self-start whitespace-pre">
        {after}
        {restWords.length > 0 ? ` ${restWords.join(" ")}` : ""}
      </span>
    </div>
  );
}

type QuizStageProps = {
  passage: SpeedTestPassage;
  answers: [number | null, number | null];
  onAnswer: (questionIndex: number, optionIndex: number) => void;
  onContinue: () => void;
  continueLabel: string;
};

function QuizStage({ passage, answers, onAnswer, onContinue, continueLabel }: QuizStageProps): React.JSX.Element {
  const allAnswered = answers.every((answer) => answer !== null);

  return (
    <>
      <h1 className="text-[21px] font-bold text-ink">Quick Check</h1>
      <p className="mt-2 text-[14px] text-ink-dim">Two questions on what you just read.</p>
      <div className="mt-5 space-y-6">
        {passage.questions.map((question, questionIndex) => (
          <div key={question.question}>
            <div className="mb-2.5 text-[14.5px] font-semibold text-ink">{question.question}</div>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onAnswer(questionIndex, optionIndex)}
                  className={`block w-full rounded-sm border px-4 py-2.5 text-left text-[13.5px] transition-colors ${
                    answers[questionIndex] === optionIndex
                      ? "border-gold bg-gold-soft font-semibold text-ink"
                      : "border-line-strong text-ink hover:border-gold/60"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={!allAnswered}
        onClick={onContinue}
        className="mt-7 inline-flex items-center gap-2 rounded-sm bg-gold px-7 py-[15px] text-[14.5px] font-semibold text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44] disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-ink-faint disabled:hover:translate-y-0"
      >
        {continueLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </>
  );
}

type ComparisonBarProps = {
  label: string;
  value: string;
  percent: number;
  tone: "gold" | "teal" | "faint";
  emphasize?: boolean;
};

function ComparisonBar({ label, value, percent, tone, emphasize = false }: ComparisonBarProps): React.JSX.Element {
  const fillClass = tone === "gold" ? "bg-gold" : tone === "teal" ? "bg-teal" : "bg-ink-dim";
  return (
    <div>
      <div className={`mb-1.5 flex justify-between text-[12.5px] ${emphasize ? "font-semibold text-ink" : "text-ink-dim"}`}>
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className={`overflow-hidden rounded-full bg-line-strong ${emphasize ? "h-3.5" : "h-2.5"}`}>
        <div className={`h-full rounded-full ${fillClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
