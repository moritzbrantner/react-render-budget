# Production-Like Render Budget Tests

Authoritative render-budget tests should run against a production-like application build served through preview or static hosting. Profiler budgets require React's profiling-capable production bundle; a standard production React bundle may omit Profiler callbacks. Development React behavior can distort render counts and timings, so budgets should be calibrated in the same kind of environment where they are enforced.

## Consequences

Examples and e2e tests should use build-and-preview flows rather than a development server when demonstrating budget assertions, and examples that assert Profiler metrics should enable React's profiling build.
