import {
  Profiler,
  useCallback,
  type ProfilerOnRenderCallback,
  type ReactNode,
} from "react";

import { recordProfilerRender } from "../core/globals";
import type { ProfilerRenderPhase, RenderMetadata } from "../core/types";

export interface RenderProfilerProps {
  id: string;
  children: ReactNode;
  enabled?: boolean;
  metadata?: RenderMetadata;
}

export function RenderProfiler({
  id,
  children,
  enabled = true,
  metadata,
}: RenderProfilerProps) {
  const handleRender = useCallback<ProfilerOnRenderCallback>(
    (
      profilerId,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
    ) => {
      recordProfilerRender({
        id: profilerId,
        phase: phase as ProfilerRenderPhase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
        ...(metadata === undefined ? {} : { metadata }),
      });
    },
    [metadata],
  );

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
}
