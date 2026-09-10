import { describe, expect, it } from "vitest";

import { assertRenderBudget } from "../src/core/budget";
import { diffRenderStats } from "../src/core/renderStatsDiff";
import type { RenderStatsSnapshot } from "../src/core/types";

const mountEvent = {
  id: "TimelineEditor",
  phase: "mount" as const,
  actualDuration: 2,
  baseDuration: 4,
  startTime: 10,
  commitTime: 12,
};

const updateEvent = {
  id: "TimelineEditor",
  phase: "update" as const,
  actualDuration: 3,
  baseDuration: 5,
  startTime: 20,
  commitTime: 23,
};

describe("render stats diff", () => {
  it("returns only render activity added between immutable snapshots", () => {
    const before: RenderStatsSnapshot = {
      profiler: {
        TimelineEditor: {
          id: "TimelineEditor",
          commits: 1,
          mounts: 1,
          updates: 0,
          nestedUpdates: 0,
          totalActualDuration: 2,
          totalBaseDuration: 4,
          events: [mountEvent],
        },
      },
      components: {
        TimelineItem: 1,
        StableRow: 1,
      },
      knownTargets: {
        profiler: ["TimelineEditor"],
        components: ["TimelineItem", "StableRow"],
      },
      documentId: "document-a",
    };
    const after: RenderStatsSnapshot = {
      profiler: {
        TimelineEditor: {
          id: "TimelineEditor",
          commits: 2,
          mounts: 1,
          updates: 1,
          nestedUpdates: 0,
          totalActualDuration: 5,
          totalBaseDuration: 9,
          events: [mountEvent, updateEvent],
        },
      },
      components: {
        TimelineItem: 2,
        StableRow: 1,
      },
      knownTargets: {
        profiler: ["TimelineEditor"],
        components: ["TimelineItem", "StableRow"],
      },
      documentId: "document-a",
    };
    const beforeCopy = structuredClone(before);
    const afterCopy = structuredClone(after);

    expect(diffRenderStats(before, after)).toEqual({
      profiler: {
        TimelineEditor: {
          id: "TimelineEditor",
          commits: 1,
          mounts: 0,
          updates: 1,
          nestedUpdates: 0,
          totalActualDuration: 3,
          totalBaseDuration: 5,
          events: [updateEvent],
        },
      },
      components: {
        TimelineItem: 1,
      },
      knownTargets: {
        profiler: ["TimelineEditor"],
        components: ["TimelineItem", "StableRow"],
      },
    });
    expect(before).toEqual(beforeCopy);
    expect(after).toEqual(afterCopy);
  });

  it("keeps known targets when the measured window contains zero work", () => {
    const snapshot: RenderStatsSnapshot = {
      profiler: {
        TimelineEditor: {
          id: "TimelineEditor",
          commits: 1,
          mounts: 1,
          updates: 0,
          nestedUpdates: 0,
          totalActualDuration: 2,
          totalBaseDuration: 4,
          events: [mountEvent],
        },
      },
      components: {
        TimelineItem: 1,
      },
      documentId: "document-a",
    };

    const difference = diffRenderStats(snapshot, snapshot);

    expect(difference).toEqual({
      profiler: {},
      components: {},
      knownTargets: {
        profiler: ["TimelineEditor"],
        components: ["TimelineItem"],
      },
    });
    expect(() =>
      assertRenderBudget(difference, {
        profiler: {
          TimelineEditor: {
            updates: 0,
          },
        },
        components: {
          TimelineItem: 0,
        },
      }),
    ).not.toThrow();
  });

  it("rejects snapshots from different browser documents", () => {
    expect(() =>
      diffRenderStats(
        {
          profiler: {},
          components: { TimelineItem: 1 },
          documentId: "document-a",
        },
        {
          profiler: {},
          components: { TimelineItem: 1 },
          documentId: "document-b",
        },
      ),
    ).toThrow(
      "Cannot diff render stats: the browser document changed during the measurement window.",
    );
  });

  it("rejects snapshots that cross a reset or otherwise move backwards", () => {
    expect(() =>
      diffRenderStats(
        {
          profiler: {},
          components: { TimelineItem: 2 },
        },
        {
          profiler: {},
          components: { TimelineItem: 1 },
        },
      ),
    ).toThrow(
      'Cannot diff render stats: Component "TimelineItem" metric "renders" decreased from 2 to 1.',
    );
  });
});
