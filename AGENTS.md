# Coding guidelines

Apply these guidelines to new and modified code by default. The user should not
need to request a separate clean-code pass.

## Readability and structure

- Use descriptive names that explain purpose. Avoid abbreviations and generic
  names when a domain-specific name makes the code clearer.
- Give each function or component one coherent responsibility. Extract helpers
  when they clarify a meaningful operation, reduce duplication, or separate
  concerns. Do not split straightforward code merely to make functions shorter.
- Keep lifecycle methods such as `connectedCallback()` focused on setup and
  orchestration. Put interaction handling, animation, sizing, and cleanup in
  focused methods when those responsibilities become substantial.
- Prefer guard clauses and straightforward control flow over deep nesting.
- Name non-obvious timing values, thresholds, and other policy constants, with
  units where applicable. Leave obvious literals inline.
- Keep state close to its owner and dependencies explicit. Avoid mutable module
  state when it can belong to a function or component.
- Prefer self-explanatory code. Use clear names and structure instead of comments
  that explain what the code does. Before adding an explanatory comment, first
  consider whether the code can be made clearer.
- Add comments only when necessary to capture a non-obvious reason, external
  constraint, or tradeoff that the code itself cannot express. Do not add routine
  narration, redundant documentation, or section-divider comments.
- Prefer the simplest design that solves the current task. Avoid speculative
  abstractions, unnecessary configuration, and extra files without a clear role.

## Astro and CSS

- Keep pages focused on composing layouts, content, and components. Move substantial
  self-contained UI behavior into a component under `src/components/`.
- Put component and page styles in descriptive files under `src/styles/` and import
  them from their owning component or page. Avoid substantial inline `<style>`
  blocks and duplicated declarations.
- When extracting scoped Astro CSS into an imported stylesheet, preserve its
  effective scope and check specificity so styles do not leak or change appearance.
- Keep content and configuration separate from interaction logic when that makes
  ownership clearer. Prefer existing configuration sources to duplicate values.
- Clean up event listeners, observers, timers, and animation frames as appropriate
  when components disconnect. Ensure reconnection does not duplicate handlers.

## Scope and behavior

- Refactoring must preserve behavior unless the user requests a behavior change.
  Preserve content, accessibility, reduced-motion behavior, timing, ordering,
  error handling, public interfaces, and output formats.
- Improve the code touched by the task without starting unrelated rewrites.
- Follow established project conventions unless the task calls for changing them.

## Verification and completion

- Before finishing, review the diff for clarity, duplication, unnecessary
  complexity, unintended behavior changes, and CSS scope changes. Address relevant
  issues as part of the task rather than deferring an obvious cleanup.
- Run `npm run build` for Astro, component, and stylesheet changes.
- Run `npm run test:weather` for weather-script or weather-configuration changes.
- Use targeted behavior checks for substantial refactors, including relevant
  edge cases. Prefer existing tests; add tests for meaningful risks rather than
  mirroring implementation details. Do not call live APIs just to check a refactor.
- Report what changed and what was verified. Clearly identify checks that could
  not be completed.
