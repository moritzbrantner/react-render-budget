# react-render-budget

The `react-render-budget` context describes explicit render instrumentation and render budget assertions for React applications tested through Playwright.

## Language

### Budget Language

**Render Budget**:
An upper bound on allowed render work during a measurement window.
_Avoid_: Exact render assertion, render expectation DSL

**Measurement Window**:
The period after stats reset during which render work is recorded for a scenario.
_Avoid_: Session, transaction

**Budget Target**:
A logical string key used for profiler stats or component render counts. Duplicate keys intentionally aggregate into the same target.
_Avoid_: Component instance, profiler instance

**Budget Assertion**:
A check that compares a render stats snapshot against a render budget and fails when any budget target exceeds its allowed maximum or is missing.
_Avoid_: Render expectation, snapshot comparison

**Budget Violation**:
A single failed budget assertion result for one target and metric.
_Avoid_: Test failure, render error

### Instrumentation Language

**React Instrumentation**:
Explicit React code added by the test author to record render work for selected budget targets.
_Avoid_: Automatic instrumentation, React patching, monkey-patching

**Profiler Budget Target**:
A budget target recorded by `RenderProfiler` from committed React Profiler callbacks.
_Avoid_: Profiler instance, React subtree name

**Component Budget Target**:
A budget target recorded by `withRenderCounter` from wrapped component function calls.
_Avoid_: Component instance, wrapper instance

**Profiler Stats**:
Aggregated committed React Profiler data for a profiler budget target.
_Avoid_: Render counter

**Component Render Count**:
The number of wrapped component function calls recorded for a component budget target.
_Avoid_: Commit count, profiler count

**Render Metadata**:
Diagnostic event data attached to profiler events. It is not used for aggregation, grouping, or budget evaluation.
_Avoid_: Budget labels, grouping keys

### Stats Language

**Internal Browser-Page Stats Store**:
Private browser-page storage used by instrumentation and Playwright helpers to exchange render stats.
_Avoid_: Public globals, external store API

**Render Stats Snapshot**:
A serializable view of profiler stats and component render counts read from the page.
_Avoid_: Store, registry

**Missing Budget Target**:
A budget target with no recorded stats during a measurement window. Missing budget targets fail budget assertions.
_Avoid_: Zero renders

### Environment Language

**Duration Budget**:
A timing-based upper bound calibrated to the same environment where it is enforced.
_Avoid_: Portable benchmark

**Production-Like Budget Environment**:
The recommended environment for authoritative render-budget tests, using an optimized app build rather than a development server. Profiler budgets require React profiling support in that build.
_Avoid_: Dev server budget environment
