# Subpath Runtime Imports

Runtime APIs stay split between `react-render-budget/react` and `react-render-budget/playwright`, while the package root remains focused on shared public types. This preserves optional Playwright peer behavior and keeps React instrumentation separate from Playwright assertion helpers.

## Consequences

Convenience root runtime exports are intentionally avoided so users import only the integration surface they need.
