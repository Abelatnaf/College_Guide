import { describe, it, expect } from "vitest";
import { recordQuizResult, getQuizHistory, getLatestQuizResult } from "./quizHistory";

describe("quizHistory", () => {
  it("returns an empty history and null latest when nothing recorded", () => {
    expect(getQuizHistory()).toEqual([]);
    expect(getLatestQuizResult()).toBeNull();
  });

  it("records a result and surfaces it as the latest", () => {
    recordQuizResult({ topMatchSlug: "mit", topMatchName: "MIT", topMatchPercent: 91 });
    const latest = getLatestQuizResult();
    expect(latest?.topMatchSlug).toBe("mit");
    expect(latest?.topMatchPercent).toBe(91);
    expect(latest?.id).toBeTruthy();
    expect(latest?.takenAt).toBeTruthy();
  });

  it("keeps the most recent result first", () => {
    recordQuizResult({ topMatchSlug: "mit", topMatchName: "MIT", topMatchPercent: 91 });
    recordQuizResult({ topMatchSlug: "harvard", topMatchName: "Harvard", topMatchPercent: 85 });
    const history = getQuizHistory();
    expect(history[0].topMatchSlug).toBe("harvard");
    expect(history[1].topMatchSlug).toBe("mit");
  });

  it("caps history at 5 entries", () => {
    for (let i = 0; i < 7; i++) {
      recordQuizResult({ topMatchSlug: `school-${i}`, topMatchName: `School ${i}`, topMatchPercent: 80 });
    }
    expect(getQuizHistory()).toHaveLength(5);
    expect(getQuizHistory()[0].topMatchSlug).toBe("school-6");
  });
});
