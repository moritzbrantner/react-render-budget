import { describe, expect, it } from "vitest";

import {
  getRenderStatsStore,
  incrementComponentRenderCount,
  readRenderStatsSnapshot,
  recordProfilerRender,
  resetBrowserRenderStats,
} from "../src/core/globals";

describe("browser render stats globals", () => {
  it("initializes render stats lazily", () => {
    resetBrowserRenderStats();

    const store = getRenderStatsStore();

    expect(store).toEqual({
      profiler: {},
      components: {},
    });
    expect(window.__RENDER_STATS__).toEqual({});
    expect(window.__COMPONENT_RENDER_COUNTS__).toEqual({});
  });

  it("records profiler events and component render counts", () => {
    resetBrowserRenderStats();

    recordProfilerRender({
      id: "TimelineEditor",
      phase: "mount",
      actualDuration: 2,
      baseDuration: 4,
      startTime: 10,
      commitTime: 12,
      metadata: { scenario: "select" },
    });
    recordProfilerRender({
      id: "TimelineEditor",
      phase: "update",
      actualDuration: 3,
      baseDuration: 5,
      startTime: 20,
      commitTime: 23,
    });
    incrementComponentRenderCount("TimelineItem");
    incrementComponentRenderCount("TimelineItem");

    const snapshot = readRenderStatsSnapshot();

    expect(snapshot.profiler.TimelineEditor).toMatchObject({
      commits: 2,
      mounts: 1,
      updates: 1,
      nestedUpdates: 0,
      totalActualDuration: 5,
      totalBaseDuration: 9,
    });
    expect(snapshot.profiler.TimelineEditor?.events).toHaveLength(2);
    expect(snapshot.components.TimelineItem).toBe(2);
  });

  it("resets render stats", () => {
    resetBrowserRenderStats();
    incrementComponentRenderCount("TimelineItem");

    resetBrowserRenderStats();

    expect(readRenderStatsSnapshot()).toEqual({
      profiler: {},
      components: {},
    });
  });
});
