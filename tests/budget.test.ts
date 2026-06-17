import { describe, expect, it } from "vitest";

import { assertRenderBudget, evaluateRenderBudget } from "../src/core/budget";
import type { RenderStatsSnapshot } from "../src/core/types";

const snapshot: RenderStatsSnapshot = {
  profiler: {
    TimelineEditor: {
      id: "TimelineEditor",
      commits: 3,
      mounts: 1,
      updates: 2,
      nestedUpdates: 0,
      totalActualDuration: 12,
      totalBaseDuration: 30,
      events: [],
    },
  },
  components: {
    TimelineItem: 8,
    LayerRow: 4,
  },
};

describe("render budget evaluation", () => {
  it("passes when stats are below numeric and object max budgets", () => {
    expect(() =>
      assertRenderBudget(snapshot, {
        profiler: {
          TimelineEditor: {
            commits: { max: 3 },
            updates: 2,
            totalActualDuration: { max: 16 },
          },
        },
        components: {
          TimelineItem: 10,
          LayerRow: { max: 5 },
        },
      }),
    ).not.toThrow();
  });

  it("reports budget failures with actual value, max, and metric", () => {
    let message = "";

    try {
      assertRenderBudget(snapshot, {
        profiler: {
          TimelineEditor: {
            updates: { max: 1 },
          },
        },
        components: {
          TimelineItem: 5,
        },
      });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message).toContain(
      'Profiler "TimelineEditor" metric "updates" exceeded budget: actual 2, expected max 1.',
    );
    expect(message).toContain(
      'Component "TimelineItem" metric "renders" exceeded budget: actual 8, expected max 5.',
    );
  });

  it("reports missing profiler ids with available profiler stats", () => {
    const violations = evaluateRenderBudget(snapshot, {
      profiler: {
        MissingProfiler: {
          commits: 1,
        },
      },
    });

    expect(violations[0]?.message).toContain(
      'Profiler "MissingProfiler" was not found. Available profilers: TimelineEditor.',
    );
  });

  it("reports missing component ids with available component stats", () => {
    const violations = evaluateRenderBudget(snapshot, {
      components: {
        MissingComponent: 1,
      },
    });

    expect(violations[0]?.message).toContain(
      'Component "MissingComponent" was not found. Available components: TimelineItem, LayerRow.',
    );
  });
});
