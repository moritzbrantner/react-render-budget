# Agent Instructions

This repository measures React render work through explicit instrumentation and assertions in Playwright tests.

- Read `README.md` for package semantics, vocabulary, examples and caveats; maintain one project overview rather than separate `CONTEXT.md` or generic domain-agent documents.
- Keep instrumentation opt-in; do not patch React globally or claim profiler commits and component function calls measure identical work.
- Preserve public package exports and target aggregation behavior unless the task explicitly changes them.
- Apply current shared coding-agent conventions (this repository has no installed convention snapshot). Verify using the affected npm typecheck, test, build and package checks documented in `package.json` and the README.
