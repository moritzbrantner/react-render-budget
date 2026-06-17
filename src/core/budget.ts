import type {
  NumericRenderBudget,
  ProfilerBudgetMetric,
  RenderBudget,
  RenderBudgetViolation,
  RenderStatsSnapshot,
} from "./types";

const profilerBudgetMetrics: ProfilerBudgetMetric[] = [
  "commits",
  "mounts",
  "updates",
  "nestedUpdates",
  "totalActualDuration",
  "totalBaseDuration",
];

function normalizeMax(budget: NumericRenderBudget): number {
  return typeof budget === "number" ? budget : budget.max;
}

function formatAvailable(ids: string[]): string {
  return ids.length > 0 ? ids.join(", ") : "none";
}

export function evaluateRenderBudget(
  snapshot: RenderStatsSnapshot,
  budget: RenderBudget,
): RenderBudgetViolation[] {
  const violations: RenderBudgetViolation[] = [];

  for (const [id, profilerBudget] of Object.entries(budget.profiler ?? {})) {
    const stats = snapshot.profiler[id];
    const availableIds = Object.keys(snapshot.profiler);

    if (!stats) {
      violations.push({
        target: "profiler",
        id,
        metric: "profiler",
        availableIds,
        message: `Profiler "${id}" was not found. Available profilers: ${formatAvailable(
          availableIds,
        )}.`,
      });
      continue;
    }

    for (const metric of profilerBudgetMetrics) {
      const metricBudget = profilerBudget[metric];

      if (metricBudget === undefined) {
        continue;
      }

      const max = normalizeMax(metricBudget);
      const actual = stats[metric];

      if (actual > max) {
        violations.push({
          target: "profiler",
          id,
          metric,
          actual,
          max,
          availableIds,
          message: `Profiler "${id}" metric "${metric}" exceeded budget: actual ${actual}, expected max ${max}.`,
        });
      }
    }
  }

  for (const [id, componentBudget] of Object.entries(budget.components ?? {})) {
    const availableIds = Object.keys(snapshot.components);
    const actual = snapshot.components[id];

    if (actual === undefined) {
      violations.push({
        target: "component",
        id,
        metric: "renders",
        availableIds,
        message: `Component "${id}" was not found. Available components: ${formatAvailable(
          availableIds,
        )}.`,
      });
      continue;
    }

    const max = normalizeMax(componentBudget);

    if (actual > max) {
      violations.push({
        target: "component",
        id,
        metric: "renders",
        actual,
        max,
        availableIds,
        message: `Component "${id}" metric "renders" exceeded budget: actual ${actual}, expected max ${max}.`,
      });
    }
  }

  return violations;
}

export function assertRenderBudget(
  snapshot: RenderStatsSnapshot,
  budget: RenderBudget,
): void {
  const violations = evaluateRenderBudget(snapshot, budget);

  if (violations.length === 0) {
    return;
  }

  const detail = violations.map((violation) => `- ${violation.message}`).join("\n");

  throw new Error(`Render budget failed:\n${detail}`);
}
