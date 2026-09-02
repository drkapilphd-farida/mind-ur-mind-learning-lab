import { describe, expect, it } from "vitest";
import { buildProgressiveChunks, computeRampWpm, RAMP_START_WPM, RAMP_CAP_WPM } from "./speedDemoPacing";

describe("buildProgressiveChunks", () => {
  it("never drops or reorders a single word", () => {
    const words = Array.from({ length: 30 }, (_, i) => `word${i}`);
    const chunks = buildProgressiveChunks(words);
    expect(chunks.join(" ").split(" ")).toEqual(words);
  });

  it("starts with single-word chunks and grows into phrases later", () => {
    const words = Array.from({ length: 30 }, (_, i) => `word${i}`);
    const chunks = buildProgressiveChunks(words);
    const chunkSizes = chunks.map((chunk) => chunk.split(" ").length);
    // The very last chunk can legitimately be a 1-word remainder even in
    // the 3-word zone (30 doesn't divide evenly) — check the sequence
    // grows overall, not that every trailing chunk is exactly size 3.
    expect(chunkSizes[0]).toBe(1);
    expect(Math.max(...chunkSizes)).toBeGreaterThan(1);
    expect(Math.max(...chunkSizes.slice(-4))).toBeGreaterThan(1);
  });

  it("handles an empty passage without throwing", () => {
    expect(buildProgressiveChunks([])).toEqual([]);
  });
});

describe("computeRampWpm", () => {
  it("starts at RAMP_START_WPM and ends at RAMP_CAP_WPM", () => {
    expect(computeRampWpm(0, 20)).toBe(RAMP_START_WPM);
    expect(computeRampWpm(19, 20)).toBe(RAMP_CAP_WPM);
  });

  it("increases monotonically and continuously, never staying flat across steps", () => {
    const totalChunks = 20;
    const speeds = Array.from({ length: totalChunks }, (_, i) => computeRampWpm(i, totalChunks));
    for (let i = 1; i < speeds.length; i++) {
      expect(speeds[i]).toBeGreaterThan(speeds[i - 1] as number);
    }
  });

  it("never divides by zero for a single-chunk passage", () => {
    expect(computeRampWpm(0, 1)).toBe(RAMP_START_WPM);
  });
});
