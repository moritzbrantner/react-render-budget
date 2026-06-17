import { describe, expectTypeOf, it } from "vitest";

import type {
  ComponentRenderCounts,
  ProfilerRenderStats,
  RenderBudget,
  RenderBudgetFixture,
  RenderStatsSnapshot,
} from "../src";

describe("public type exports", () => {
  it("exports the stable public package types", () => {
    expectTypeOf<ComponentRenderCounts>().toMatchTypeOf<Record<string, number>>();
    expectTypeOf<RenderStatsSnapshot>().toHaveProperty("profiler");
    expectTypeOf<RenderStatsSnapshot>().toHaveProperty("components");
    expectTypeOf<ProfilerRenderStats>().toHaveProperty("events");
    expectTypeOf<RenderBudget>().toHaveProperty("components");
    expectTypeOf<RenderBudgetFixture>().toHaveProperty("expectBudget");
  });
});
