import { describe, expect, it } from "vitest";
import { PASSAGE_LIBRARY } from "@/features/quantum-speed-reading/passageLibrary";
import { SPEED_TEST_PASSAGE_POOL, pickRandomPassagePair } from "./speedTestPassagePool";

describe("SPEED_TEST_PASSAGE_POOL", () => {
  it("draws all 24 real passages from the product's passage library", () => {
    expect(SPEED_TEST_PASSAGE_POOL.length).toBe(24);
    expect(SPEED_TEST_PASSAGE_POOL.length).toBe(PASSAGE_LIBRARY.length);
  });

  it("gives every passage real text and exactly two comprehension questions with a valid correct answer", () => {
    for (const passage of SPEED_TEST_PASSAGE_POOL) {
      expect(passage.text.length).toBeGreaterThan(0);
      expect(passage.questions).toHaveLength(2);
      for (const question of passage.questions) {
        expect(question.options).toHaveLength(3);
        expect(question.correctIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctIndex).toBeLessThan(3);
      }
    }
  });

  it("has no duplicate passage text", () => {
    const texts = new Set(SPEED_TEST_PASSAGE_POOL.map((passage) => passage.text));
    expect(texts.size).toBe(SPEED_TEST_PASSAGE_POOL.length);
  });
});

describe("pickRandomPassagePair", () => {
  it("always returns two distinct passages from the real pool", () => {
    for (let i = 0; i < 200; i++) {
      const [first, second] = pickRandomPassagePair();
      expect(first).not.toBe(second);
      expect(SPEED_TEST_PASSAGE_POOL).toContain(first);
      expect(SPEED_TEST_PASSAGE_POOL).toContain(second);
    }
  });

  it("uses real randomness rather than a fixed index across repeated calls", () => {
    const firstPassagesSeen = new Set(Array.from({ length: 100 }, () => pickRandomPassagePair()[0]));
    // With 24 passages and 100 draws, seeing only one distinct "first" pick
    // would mean Math.random() isn't actually wired in.
    expect(firstPassagesSeen.size).toBeGreaterThan(1);
  });
});
