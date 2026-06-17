import { bench, describe } from "vitest";

import { evaluateRenderBudget } from "../src/core/budget";
import {
  recordProfilerRender,
  resetBrowserRenderStats,
  readRenderStatsSnapshot,
} from "../src/core/globals";
import type { RenderBudget, RenderStatsSnapshot } from "../src/core/types";

function createSnapshot(size: number): RenderStatsSnapshot {
  const profiler: RenderStatsSnapshot["profiler"] = {};
  const components: RenderStatsSnapshot["components"] = {};

  for (let index = 0; index < size; index += 1) {
    const id = `Component${index}`;

    profiler[id] = {
      id,
      commits: 5,
      mounts: 1,
      updates: 4,
      nestedUpdates: 0,
      totalActualDuration: 4.5,
      totalBaseDuration: 8,
      events: [],
    };
    components[id] = 5;
  }

  return { profiler, components };
}

const snapshot = createSnapshot(100);
const budget: RenderBudget = {
  profiler: Object.fromEntries(
    Object.keys(snapshot.profiler).map((id) => [id, { commits: { max: 10 } }]),
  ),
  components: Object.fromEntries(
    Object.keys(snapshot.components).map((id) => [id, { max: 10 }]),
  ),
};

describe("render budget evaluation", () => {
  bench("evaluates a snapshot with 100 profilers and component counters", () => {
    evaluateRenderBudget(snapshot, budget);
  });
});

describe("browser render stats store", () => {
  bench("records 100 profiler events and reads a snapshot", () => {
    resetBrowserRenderStats();

    for (let index = 0; index < 100; index += 1) {
      recordProfilerRender({
        id: `Component${index % 10}`,
        phase: index === 0 ? "mount" : "update",
        actualDuration: 1,
        baseDuration: 2,
        startTime: index,
        commitTime: index + 1,
      });
    }

    readRenderStatsSnapshot();
  });
});
