# Explicit React Instrumentation

`react-render-budget` records render work only where users explicitly add `RenderProfiler` or `withRenderCounter`. We will not patch React globally or add automatic framework instrumentation in the core package, because explicit instrumentation keeps naming, scope, and runtime behavior under the test author's control.

## Considered Options

- Explicit wrappers and profilers
- Automatic instrumentation or React monkey-patching
- A separate devtool-style automatic instrumentation package

## Consequences

Users must choose the budget targets they care about, and future automatic instrumentation work should live outside the core package unless this decision is revisited.
