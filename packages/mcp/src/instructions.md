## Documentation Workflow

1. Call **list-all-documentation** once at the start of the task to discover available component and docs IDs.
2. Call **get-documentation** with an `id` from that list to retrieve full component docs, props, usage examples, and stories.
3. Call **get-documentation-for-story** when you need additional docs from a specific story variant that was not included in the initial component documentation.
4. Call **read-component-code** with a `componentId` to read the actual source code of a component's implementation file. Prefer `componentId` over `storyId`; only use `storyId` as a fallback if you don't have the component ID.

Use `withStoryIds: true` on **list-all-documentation** when you also need story IDs for inputs to other tools.

## Design System Workflow

1. Call **get-design-tokens** to retrieve the project's color tokens, typography tokens, and other CSS custom properties. Use these tokens when building or styling components.
2. Call **get-design-guidelines** to retrieve foundational design documentation (e.g. getting-started guides, theming docs, design principles) from the project's MDX/Markdown files.

## Verification Rules

- Never assume component props, variants, or API shape. Retrieve documentation before using a component.
- If a component or prop is not documented, do not invent it. Report that it was not found.
- Only reference IDs returned by **list-all-documentation**. Do not guess IDs.

## Multi-Source Requests

- When multiple Storybook sources are configured, **list-all-documentation** returns entries from all sources.
- Use `storybookId` in **get-documentation** and **read-component-code** when you need to scope a request to one source.
