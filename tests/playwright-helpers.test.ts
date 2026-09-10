import { beforeEach, describe, expect, it } from "vitest";
import type { Page } from "@playwright/test";

import { expectRenderBudget } from "../src/playwright/expectRenderBudget";
import { expectRenderBudgetAfter } from "../src/playwright/expectRenderBudgetAfter";
import { getRenderStats } from "../src/playwright/getRenderStats";
import { measureRenderScenario } from "../src/playwright/measureRenderScenario";
import { resetRenderStats } from "../src/playwright/resetRenderStats";

function createPageStub(): Page {
  return {
    evaluate: async <Result, Arg>(
      pageFunction: string | ((arg: Arg) => Result | Promise<Result>),
      arg?: Arg,
    ): Promise<Result> => {
      if (typeof pageFunction !== "function") {
        throw new Error("String page functions are not supported by this stub.");
      }

      return pageFunction(arg as Arg);
    },
  } as Page;
}

beforeEach(() => {
  delete window.__RENDER_STATS__;
  delete window.__COMPONENT_RENDER_COUNTS__;
  delete window.__RENDER_PROFILER_TARGETS__;
  delete window.__COMPONENT_RENDER_TARGETS__;
});

describe("Playwright helpers", () => {
  it("resets and reads browser stats through page.evaluate", async () => {
    window.__RENDER_STATS__ = {
      TimelineEditor: {
        id: "TimelineEditor",
        commits: 1,
        mounts: 1,
        updates: 0,
        nestedUpdates: 0,
        totalActualDuration: 1,
        totalBaseDuration: 2,
        events: [],
      },
    };
    window.__COMPONENT_RENDER_COUNTS__ = {
      TimelineItem: 1,
    };
    window.__RENDER_PROFILER_TARGETS__ = { TimelineEditor: true };
    window.__COMPONENT_RENDER_TARGETS__ = { TimelineItem: true };

    const page = createPageStub();

    await resetRenderStats(page);

    expect(await getRenderStats(page)).toEqual({
      profiler: {},
      components: {},
    });
  });

  it("allows zero budgets for known targets after a reset", async () => {
    window.__RENDER_PROFILER_TARGETS__ = { TimelineEditor: true };
    window.__COMPONENT_RENDER_TARGETS__ = { TimelineItem: true };

    const page = createPageStub();

    await resetRenderStats(page);

    const snapshot = await expectRenderBudget(page, {
      profiler: {
        TimelineEditor: {
          commits: 0,
          updates: 0,
        },
      },
      components: {
        TimelineItem: 0,
      },
    });

    expect(snapshot).toEqual({
      profiler: {},
      components: {},
    });
  });

  it("returns the snapshot after a passing budget assertion", async () => {
    window.__RENDER_STATS__ = {};
    window.__COMPONENT_RENDER_COUNTS__ = {
      TimelineItem: 2,
    };

    const page = createPageStub();
    const snapshot = await expectRenderBudget(page, {
      components: {
        TimelineItem: 3,
      },
    });

    expect(snapshot.components.TimelineItem).toBe(2);
  });

  it("measures an action from immutable before and after snapshots", async () => {
    window.__COMPONENT_RENDER_COUNTS__ = { TimelineItem: 2 };
    window.__COMPONENT_RENDER_TARGETS__ = {
      TimelineItem: true,
      StableRow: true,
    };

    const page = createPageStub();
    const snapshot = await measureRenderScenario(page, async () => {
      window.__COMPONENT_RENDER_COUNTS__ = { TimelineItem: 3 };
    });

    expect(snapshot.components).toEqual({ TimelineItem: 1 });
    expect(snapshot.knownTargets?.components).toEqual([
      "TimelineItem",
      "StableRow",
    ]);
  });

  it("asserts a budget directly around an action without resetting", async () => {
    window.__COMPONENT_RENDER_COUNTS__ = { TimelineItem: 2 };
    window.__COMPONENT_RENDER_TARGETS__ = {
      TimelineItem: true,
      StableRow: true,
    };

    const page = createPageStub();
    const snapshot = await expectRenderBudgetAfter(
      page,
      async () => {
        window.__COMPONENT_RENDER_COUNTS__ = { TimelineItem: 3 };
      },
      {
        components: {
          TimelineItem: 1,
          StableRow: 0,
        },
      },
    );

    expect(snapshot.components).toEqual({ TimelineItem: 1 });
  });
});
