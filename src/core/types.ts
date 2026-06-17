export type ProfilerRenderPhase = "mount" | "update" | "nested-update";

export type RenderMetadata = Record<string, unknown>;

export interface ProfilerRenderEvent {
  id: string;
  phase: ProfilerRenderPhase;
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  metadata?: RenderMetadata;
}

export interface ProfilerRenderStats {
  id: string;
  commits: number;
  mounts: number;
  updates: number;
  nestedUpdates: number;
  totalActualDuration: number;
  totalBaseDuration: number;
  events: ProfilerRenderEvent[];
}

export type ComponentRenderCounts = Record<string, number>;

export interface RenderStatsSnapshot {
  profiler: Record<string, ProfilerRenderStats>;
  components: ComponentRenderCounts;
}

export type ProfilerBudgetMetric =
  | "commits"
  | "mounts"
  | "updates"
  | "nestedUpdates"
  | "totalActualDuration"
  | "totalBaseDuration";

export type NumericRenderBudget = number | { max: number };

export type ProfilerRenderBudget = Partial<
  Record<ProfilerBudgetMetric, NumericRenderBudget>
>;

export interface RenderBudget {
  profiler?: Record<string, ProfilerRenderBudget>;
  components?: Record<string, NumericRenderBudget>;
}

export interface RenderBudgetViolation {
  target: "profiler" | "component";
  id: string;
  metric: string;
  actual?: number;
  max?: number;
  availableIds: string[];
  message: string;
}

export interface RenderBudgetFixture {
  reset: () => Promise<void>;
  get: () => Promise<RenderStatsSnapshot>;
  expectBudget: (budget: RenderBudget) => Promise<RenderStatsSnapshot>;
}

declare global {
  interface Window {
    __RENDER_STATS__?: Record<string, ProfilerRenderStats>;
    __COMPONENT_RENDER_COUNTS__?: ComponentRenderCounts;
  }
}
