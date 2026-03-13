import * as v from 'valibot';
import type { McpServer } from 'tmcp';
import type { ComponentManifest, StorybookContext } from '../types.ts';
import { StorybookIdField } from '../types.ts';
import { errorToMCPContent, getManifests } from '../utils/get-manifest.ts';
import { LIST_TOOL_NAME } from './list-all-documentation.ts';

export const READ_COMPONENT_CODE_TOOL_NAME = 'read-component-code';

const BaseInput = {
	componentId: v.pipe(
		v.optional(v.string()),
		v.description('The component ID (e.g., "button"). Use list-all-documentation to discover IDs. Provide either componentId or storyId.'),
	),
	storyId: v.pipe(
		v.optional(v.string()),
		v.description(
			'A story ID (e.g., "button--primary"). The parent component\'s source code will be returned. Provide either componentId or storyId. Prefer componentId when available.',
		),
	),
};

/**
 * Resolve a component by ID with fallbacks:
 * 1. Exact key match
 * 2. Case-insensitive key match
 * 3. Case-insensitive component name match
 */
function resolveComponentById(
	components: Record<string, ComponentManifest>,
	componentId: string,
): ComponentManifest | undefined {
	if (components[componentId]) {
		return components[componentId];
	}

	const lowerInput = componentId.toLowerCase();
	for (const [key, component] of Object.entries(components)) {
		if (key.toLowerCase() === lowerInput) {
			return component;
		}
	}

	for (const component of Object.values(components)) {
		if (component.name.toLowerCase() === lowerInput) {
			return component;
		}
	}

	return undefined;
}

function resolveComponentByStoryId(
	components: Record<string, ComponentManifest>,
	storyId: string,
): ComponentManifest | undefined {
	for (const component of Object.values(components)) {
		if (component.stories?.some((s) => s.id === storyId)) {
			return component;
		}
	}
	return undefined;
}

/**
 * Extract the component source file path from docgen metadata, if available.
 */
function getDocgenSourcePath(component: ComponentManifest): string | undefined {
	if (component.reactDocgenTypescript?.filePath) {
		return component.reactDocgenTypescript.filePath;
	}
	if (component.reactDocgen?.filePath) {
		return component.reactDocgen.filePath;
	}
	return undefined;
}

/**
 * Derive candidate component file paths from a story file path by stripping
 * `.stories` and trying common extensions. For example:
 *   `src/Button.stories.ts` → [`src/Button.tsx`, `src/Button.ts`, `src/Button.jsx`, `src/Button.js`]
 */
function deriveComponentPathCandidates(storyPath: string): string[] {
	const match = storyPath.match(/^(.+)\.stories\.(tsx?|jsx?|mts|cts)$/);
	if (!match) return [];
	const base = match[1];
	return [`${base}.tsx`, `${base}.ts`, `${base}.jsx`, `${base}.js`];
}

function formatComponentCode(component: ComponentManifest, sourcePath: string, code: string): string {
	const parts: string[] = [];
	parts.push(`# ${component.name}`);
	parts.push('');
	parts.push(`File: ${sourcePath}`);
	parts.push('');
	parts.push('```');
	parts.push(code);
	parts.push('```');
	return parts.join('\n');
}

export async function addReadComponentCodeTool(
	server: McpServer<any, StorybookContext>,
	enabled?: Parameters<McpServer<any, StorybookContext>['tool']>[0]['enabled'],
	options?: { multiSource?: boolean },
) {
	const schema = options?.multiSource
		? v.object({ ...BaseInput, ...StorybookIdField })
		: v.object(BaseInput);

	server.tool(
		{
			name: READ_COMPONENT_CODE_TOOL_NAME,
			title: 'Read Component Code',
			description: `Read the actual source code of a UI component. Accepts either a componentId or a storyId to identify the component. Returns the full source file contents for the component's implementation file.

Use this when you need to understand how a component is implemented, not just its documentation or story snippets.

Prefer componentId over storyId. Use list-all-documentation to discover component IDs. Only fall back to storyId if you don't have the componentId.`,
			schema,
			enabled,
		},
		async (
			input: { componentId?: string; storyId?: string; storybookId?: string },
		) => {
			try {
				const ctx = server.ctx.custom;
				const { componentId, storyId, storybookId } = input;
				const sources = ctx?.sources;
				const isMultiSource = sources && sources.some((s) => s.url);

				let source;
				if (isMultiSource) {
					if (!storybookId) {
						const availableSources = sources.map((s) => s.id).join(', ');
						return {
							content: [
								{
									type: 'text' as const,
									text: `storybookId is required. Available sources: ${availableSources}. Use the ${LIST_TOOL_NAME} tool to see available sources.`,
								},
							],
							isError: true,
						};
					}

					source = sources.find((s) => s.id === storybookId);
					if (!source) {
						const availableSources = sources.map((s) => s.id).join(', ');
						return {
							content: [
								{
									type: 'text' as const,
									text: `Storybook source not found: "${storybookId}". Available sources: ${availableSources}. Use the ${LIST_TOOL_NAME} tool to see available sources.`,
								},
							],
							isError: true,
						};
					}
				}

				const { componentManifest } = await getManifests(
					ctx?.request,
					ctx?.manifestProvider,
					source,
				);

				let component: ComponentManifest | undefined;

				if (componentId) {
					component = resolveComponentById(componentManifest.components, componentId);
					if (!component) {
						return {
							content: [
								{
									type: 'text' as const,
									text: `Component not found: "${componentId}". Use the ${LIST_TOOL_NAME} tool to see available components.`,
								},
							],
							isError: true,
						};
					}
				} else if (storyId) {
					component = resolveComponentByStoryId(componentManifest.components, storyId);
					if (!component) {
						return {
							content: [
								{
									type: 'text' as const,
									text: `No component found for story ID "${storyId}". Use the ${LIST_TOOL_NAME} tool to see available components and stories.`,
								},
							],
							isError: true,
						};
					}
				} else {
					return {
						content: [
							{
								type: 'text' as const,
								text: 'Either componentId or storyId must be provided.',
							},
						],
						isError: true,
					};
				}

				if (!ctx?.fileReader) {
					return {
						content: [
							{
								type: 'text' as const,
								text: `Component "${component.name}" found at path "${component.path}", but file reading is not available in this environment. The component source code cannot be retrieved.`,
							},
						],
						isError: true,
					};
				}

				// Build ordered list of paths to try:
				// 1. Docgen filePath (actual component source)
				// 2. Heuristic: strip .stories from the story path, try common extensions
				// 3. component.path (the story/CSF file, as last resort)
				const docgenPath = getDocgenSourcePath(component);
				const candidates = docgenPath
					? [docgenPath]
					: [...deriveComponentPathCandidates(component.path), component.path];

				let code: string | undefined;
				let sourcePath: string | undefined;
				for (const candidate of candidates) {
					code = await ctx.fileReader(candidate);
					if (code !== undefined) {
						sourcePath = candidate;
						break;
					}
				}

				if (code === undefined || sourcePath === undefined) {
					return {
						content: [
							{
								type: 'text' as const,
								text: `Could not read source file for component "${component.name}". Tried: ${candidates.join(', ')}. The file may have been moved or deleted.`,
							},
						],
						isError: true,
					};
				}

				return {
					content: [
						{
							type: 'text' as const,
							text: formatComponentCode(component, sourcePath, code),
						},
					],
				};
			} catch (error) {
				return errorToMCPContent(error);
			}
		},
	);
}
