import { describe, expect, it } from "vitest";
import type { Page } from "@playwright/test";

import { expectRenderBudget } from "../src/playwright/expectRenderBudget";
import { getRenderStats } from "../src/playwright/getRenderStats";
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

    const page = createPageStub();

    await resetRenderStats(page);

    expect(await getRenderStats(page)).toEqual({
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
});
