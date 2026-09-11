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

function uniqueIds(observedIds: string[], knownIds: string[]): string[] {
  return [...new Set([...observedIds, ...knownIds])];
}

function formatAvailable(ids: string[]): string {
  return ids.length > 0 ? ids.join(", ") : "none";
}

export function evaluateRenderBudget(
  snapshot: RenderStatsSnapshot,
  budget: RenderBudget,
): RenderBudgetViolation[] {
  const violations: RenderBudgetViolation[] = [];
  const knownProfilerTargets = snapshot.knownTargets?.profiler ?? [];
  const knownComponentTargets = snapshot.knownTargets?.components ?? [];

  for (const [id, profilerBudget] of Object.entries(budget.profiler ?? {})) {
    const stats = snapshot.profiler[id];
    const availableIds = uniqueIds(
      Object.keys(snapshot.profiler),
      knownProfilerTargets,
    );
    const isKnownTarget = stats !== undefined || knownProfilerTargets.includes(id);

    if (!isKnownTarget) {
      violations.push({
        target: "profiler",
        id,
        metric: "profiler",
        availableIds,
        message: `Profiler budget target "${id}" was not found. Available profiler budget targets: ${formatAvailable(
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
      const actual = stats?.[metric] ?? 0;

      if (actual > max) {
        violations.push({
          target: "profiler",
          id,
          metric,
          actual,
          max,
          availableIds,
          message: `Profiler budget target "${id}" metric "${metric}" exceeded budget: actual ${actual}, expected max ${max}.`,
        });
      }
    }
  }

  for (const [id, componentBudget] of Object.entries(budget.components ?? {})) {
    const availableIds = uniqueIds(
      Object.keys(snapshot.components),
      knownComponentTargets,
    );
    const observed = snapshot.components[id];
    const isKnownTarget =
      observed !== undefined || knownComponentTargets.includes(id);

    if (!isKnownTarget) {
      violations.push({
        target: "component",
        id,
        metric: "renders",
        availableIds,
        message: `Component budget target "${id}" was not found. Available component budget targets: ${formatAvailable(
          availableIds,
        )}.`,
      });
      continue;
    }

    const actual = observed ?? 0;
    const max = normalizeMax(componentBudget);

    if (actual > max) {
      violations.push({
        target: "component",
        id,
        metric: "renders",
        actual,
        max,
        availableIds,
        message: `Component budget target "${id}" metric "renders" exceeded budget: actual ${actual}, expected max ${max}.`,
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
