import { describe, expect, it } from "vitest";

import { evaluateRenderBudget } from "../src/core/budget";
import type { ProfilerBudgetMetric, RenderBudget, RenderStatsSnapshot } from "../src/core/types";

const metrics: ProfilerBudgetMetric[] = [
  "commits",
  "mounts",
  "updates",
  "nestedUpdates",
  "totalActualDuration",
  "totalBaseDuration",
];

const snapshot: RenderStatsSnapshot = {
  profiler: {
    Sample: {
      id: "Sample",
      commits: 6,
      mounts: 5,
      updates: 4,
      nestedUpdates: 3,
      totalActualDuration: 2,
      totalBaseDuration: 1,
      events: [],
    },
  },
  components: {
    Empty: 0,
    Row: 4,
  },
};

const sampleProfiler = snapshot.profiler.Sample;
if (!sampleProfiler) {
  throw new Error("Sample profiler fixture must exist");
}

describe("budget threshold boundaries", () => {
  it("treats every profiler maximum as inclusive", () => {
    for (const metric of metrics) {
      const actual = sampleProfiler[metric];
      const atLimit: RenderBudget = {
        profiler: { Sample: { [metric]: actual } },
      };
      const belowLimit: RenderBudget = {
        profiler: { Sample: { [metric]: { max: actual - 1 } } },
      };

      expect(evaluateRenderBudget(snapshot, atLimit), metric).toEqual([]);
      expect(evaluateRenderBudget(snapshot, belowLimit), metric).toEqual([
        expect.objectContaining({
          target: "profiler",
          id: "Sample",
          metric,
          actual,
          max: actual - 1,
        }),
      ]);
    }
  });

  it("gives numeric and object component budgets identical boundary semantics", () => {
    for (const max of [3, 4, 5]) {
      const numeric = evaluateRenderBudget(snapshot, { components: { Row: max } });
      const object = evaluateRenderBudget(snapshot, { components: { Row: { max } } });
      expect(object).toEqual(numeric);
    }
  });

  it("does not confuse a zero render count with a missing component", () => {
    expect(evaluateRenderBudget(snapshot, { components: { Empty: 0 } })).toEqual([]);
    expect(evaluateRenderBudget(snapshot, { components: { Empty: { max: 0 } } })).toEqual([]);
  });
});
