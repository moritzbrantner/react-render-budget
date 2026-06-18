# Private Browser-Page Stats Store

Instrumentation writes to browser-page storage so Playwright helpers can read render stats, but that storage is an implementation detail rather than a public integration point. Users should depend on the React instrumentation and Playwright helper APIs, preserving freedom to change the storage internals before broader adoption.

## Consequences

User-facing docs should describe an internal browser-page stats store instead of documenting global variable names as stable API.
