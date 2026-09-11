import { beforeEach, describe, expect, it } from "vitest";

import {
  getBrowserPageStatsStore,
  incrementComponentRenderCount,
  readRenderStatsSnapshot,
  recordProfilerRender,
  resetBrowserPageStatsStore,
} from "../src/core/browserPageStatsStore";

beforeEach(() => {
  delete window.__RENDER_STATS__;
  delete window.__COMPONENT_RENDER_COUNTS__;
  delete window.reactRenderBudgetKnownTargets;
});

describe("browser-page stats store", () => {
  it("initializes render stats and target registries lazily", () => {
    resetBrowserPageStatsStore();

    const store = getBrowserPageStatsStore();

    expect(store).toEqual({
      profiler: {},
      components: {},
      knownTargets: {
        profiler: [],
        components: [],
      },
    });
    expect(window.__RENDER_STATS__).toEqual({});
    expect(window.__COMPONENT_RENDER_COUNTS__).toEqual({});
    expect(window.reactRenderBudgetKnownTargets).toEqual({
      profiler: {},
      components: {},
    });
  });

  it("records profiler events, component counts, and known targets", () => {
    resetBrowserPageStatsStore();

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
    expect(snapshot.knownTargets).toEqual({
      profiler: ["TimelineEditor"],
      components: ["TimelineItem"],
    });
  });

  it("resets activity while preserving known targets", () => {
    resetBrowserPageStatsStore();
    recordProfilerRender({
      id: "TimelineEditor",
      phase: "mount",
      actualDuration: 2,
      baseDuration: 4,
      startTime: 10,
      commitTime: 12,
    });
    incrementComponentRenderCount("TimelineItem");

    resetBrowserPageStatsStore();

    expect(readRenderStatsSnapshot()).toEqual({
      profiler: {},
      components: {},
      knownTargets: {
        profiler: ["TimelineEditor"],
        components: ["TimelineItem"],
      },
    });
  });
});
