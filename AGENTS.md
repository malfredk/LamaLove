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

- Organize feature-specific code as vertical slices under `src/features/<feature>/`.
  Use the page features `home`, `information`, `visitor`, and `timeline`. Place
  page-specific subfeatures under their page, such as `information/weather/`.
  Colocate each feature's components, styles, configuration, logic, tests, data,
  preview pages, and assets. Keep related modules separate when they have distinct
  responsibilities; a feature folder does not require one large file.
- Keep pages focused on composing layouts, content, and components. Move substantial
  self-contained UI behavior into its owning feature. Keep reusable components,
  layouts, styles, assets, and site configuration under `src/common/` when multiple
  features use them. Common code must not import feature implementations or assets.
- Put styles in descriptive files alongside their owning feature and import them
  from the owning component or page. Use `src/common/styles/` for shared styles. Avoid
  substantial inline `<style>` blocks and duplicated declarations.
- Keep `src/pages/` as thin routing adapters. Colocate feature-specific CLI scripts
  with their feature; npm commands and workflow files invoke them directly. Keep
  Node-only filesystem and update code separate from modules imported by browser
  code. Register local preview routes only during development.
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
- Remove unused imports, variables, functions, selectors, and obsolete or
  overridden declarations from edited files as part of each task. Preserve code
  used by dynamic states and keep cleanup within the task's scope.
- Follow established project conventions unless the task calls for changing them.

## Verification and completion

- Before finishing, review the diff for clarity, duplication, unnecessary
  complexity, unintended behavior changes, and CSS scope changes. Address relevant
  issues as part of the task rather than deferring an obvious cleanup.
- Run `npm run build` for Astro, component, and stylesheet changes.
- Run `npm run test:weather` for weather-feature or weather-entry-point changes.
- Use targeted behavior checks for substantial refactors, including relevant
  edge cases. Prefer existing tests; add tests for meaningful risks rather than
  mirroring implementation details. Do not call live APIs just to check a refactor.
- Report what changed and what was verified. Clearly identify checks that could
  not be completed.
