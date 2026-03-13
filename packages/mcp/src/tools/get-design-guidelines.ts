import type { McpServer } from 'tmcp';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { errorToMCPContent, getManifests } from '../utils/get-manifest.ts';
import type { StorybookContext } from '../types.ts';

export const GET_DESIGN_GUIDELINES_TOOL_NAME = 'get-design-guidelines';

type GuidelineEntry = {
	title: string;
	filePath: string;
	content: string;
};

const GUIDELINE_NAME_PATTERNS = [
	'getting-started',
	'get-started',
	'intro',
	'introduction',
	'overview',
	'guidelines',
	'guide',
	'foundations',
	'foundation',
	'theming',
	'theme',
	'design-principles',
	'principles',
	'usage',
	'welcome',
	'readme',
];

/**
 * Check if a single name segment matches any guideline pattern.
 */
function matchesGuidelinePattern(name: string): boolean {
	const lower = name.toLowerCase();
	return GUIDELINE_NAME_PATTERNS.some(
		(pattern) =>
			lower === pattern || lower.startsWith(`${pattern}-`) || lower.endsWith(`-${pattern}`),
	);
}

function isGuidelineFile(filename: string): boolean {
	const name = filename.replace(/\.(mdx|md)$/i, '').toLowerCase();
	return matchesGuidelinePattern(name);
}

/**
 * Check if any parent directory in the file path matches a guideline-like name.
 */
function isInGuidelineDirectory(filePath: string): boolean {
	const parts = filePath.split(path.sep);
	for (let i = 0; i < parts.length - 1; i++) {
		if (matchesGuidelinePattern(parts[i])) {
			return true;
		}
	}
	return false;
}

function isStandaloneDoc(content: string): boolean {
	const hasMetaOfPattern = /Meta\s+of=\{/.test(content);
	return !hasMetaOfPattern;
}

function extractTitle(content: string, filePath: string): string {
	const titleMatch = content.match(/^#\s+(.+)$/m);
	if (titleMatch) {
		return titleMatch[1].trim();
	}
	return path.basename(filePath, path.extname(filePath));
}

async function scanForMDXFiles(dir: string): Promise<string[]> {
	const mdxFiles: string[] = [];
	try {
		const entries = await fs.readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isFile() && /\.(mdx|md)$/i.test(entry.name)) {
				mdxFiles.push(fullPath);
			} else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
				const nested = await scanForMDXFiles(fullPath);
				mdxFiles.push(...nested);
			}
		}
	} catch {
		// directory not accessible
	}
	return mdxFiles;
}

function resolveStoryDirs(stories: unknown[], configDir: string): string[] {
	const dirs = new Set<string>();
	for (const entry of stories) {
		if (typeof entry === 'string') {
			const parts = entry.split(/[*{]/);
			if (parts[0]) {
				const dir = path.resolve(configDir, parts[0].replace(/\/+$/, ''));
				dirs.add(dir);
			}
		} else if (typeof entry === 'object' && entry !== null && 'directory' in entry) {
			const dirEntry = (entry as { directory: string }).directory;
			dirs.add(path.resolve(configDir, dirEntry));
		}
	}
	return Array.from(dirs);
}

function formatGuidelines(guidelines: GuidelineEntry[]): string {
	const parts: string[] = [];
	parts.push('# Design Guidelines');
	parts.push('');

	for (const entry of guidelines) {
		parts.push(`## ${entry.title}`);
		parts.push('');
		parts.push(`Source: ${entry.filePath}`);
		parts.push('');
		parts.push(entry.content);
		parts.push('');
	}

	return parts.join('\n').trim();
}

/**
 * Check if a docs/component manifest entry matches guideline patterns.
 */
function isGuidelineEntry(id: string, title: string): boolean {
	if (matchesGuidelinePattern(id)) return true;
	const titleSegments = title.split('/').map((s) => s.trim());
	return titleSegments.some((segment) => matchesGuidelinePattern(segment));
}

/**
 * Fallback: search the component and docs manifests for entries matching guideline patterns.
 */
async function findGuidelineDocsFallback(
	server: McpServer<any, StorybookContext>,
): Promise<string | undefined> {
	try {
		const ctx = server.ctx.custom;
		const { request, manifestProvider } = ctx ?? {};

		const { componentManifest, docsManifest } = await getManifests(request, manifestProvider);

		const guidelines: GuidelineEntry[] = [];

		if (docsManifest) {
			for (const doc of Object.values(docsManifest.docs)) {
				if (isGuidelineEntry(doc.id, doc.title)) {
					guidelines.push({
						title: doc.title,
						filePath: doc.path,
						content: doc.content,
					});
				}
			}
		}

		for (const component of Object.values(componentManifest.components)) {
			if (!isGuidelineEntry(component.id, component.name)) continue;

			const docContents: string[] = [];
			if (component.description) {
				docContents.push(component.description);
			}
			if (component.docs) {
				for (const doc of Object.values(component.docs)) {
					if (doc.content.trim().length > 0) {
						docContents.push(doc.content);
					}
				}
			}
			if (docContents.length > 0) {
				guidelines.push({
					title: component.name,
					filePath: component.path,
					content: docContents.join('\n\n'),
				});
			}
		}

		if (guidelines.length === 0) {
			return undefined;
		}

		return formatGuidelines(guidelines);
	} catch {
		return undefined;
	}
}

export async function addGetDesignGuidelinesTool(
	server: McpServer<any, StorybookContext>,
	enabled?: Parameters<McpServer<any, StorybookContext>['tool']>[0]['enabled'],
) {
	server.tool(
		{
			name: GET_DESIGN_GUIDELINES_TOOL_NAME,
			title: 'Get Design Guidelines',
			description: `Returns design guidelines and foundational documentation from the Storybook project.

Scans the project's story directories for standalone MDX/Markdown files that contain introductory content, theming guides, design principles, and other foundational documentation. Returns the content of files matching guideline-like names (e.g., getting-started, theming, foundations, guidelines, overview) or files inside guideline-named directories (e.g., foundations/, guidelines/).`,
			enabled,
		},
		async () => {
			try {
				const ctx = server.ctx.custom;
				const configDir = ctx?.configDir;

				const guidelines: GuidelineEntry[] = [];

				if (configDir) {
					let storyDirs: string[] = [];
					try {
						const storiesConfig = await ctx?.storiesResolver?.();
						if (Array.isArray(storiesConfig)) {
							storyDirs = resolveStoryDirs(storiesConfig, configDir);
						}
					} catch {
						storyDirs = [path.dirname(configDir)];
					}

					if (storyDirs.length === 0) {
						storyDirs = [path.dirname(configDir)];
					}

					const seen = new Set<string>();

					for (const dir of storyDirs) {
						const mdxFiles = await scanForMDXFiles(dir);
						for (const filePath of mdxFiles) {
							if (seen.has(filePath)) continue;
							seen.add(filePath);

							const basename = path.basename(filePath);
							if (!isGuidelineFile(basename) && !isInGuidelineDirectory(filePath)) continue;

							try {
								const content = await fs.readFile(filePath, 'utf-8');
								if (!isStandaloneDoc(content)) continue;

								const title = extractTitle(content, filePath);
								guidelines.push({
									title,
									filePath: path.relative(process.cwd(), filePath),
									content: content.trim(),
								});
							} catch {
								// skip unreadable files
							}
						}
					}
				}

				if (guidelines.length === 0) {
					const fallback = await findGuidelineDocsFallback(server);
					if (fallback) {
						return {
							content: [{ type: 'text' as const, text: fallback }],
						};
					}

					return {
						content: [
							{
								type: 'text' as const,
								text: `No design guidelines found. This tool looks for standalone MDX/Markdown files with guideline-like names (${GUIDELINE_NAME_PATTERNS.slice(0, 5).join(', ')}, etc.) in your Storybook story directories.`,
							},
						],
					};
				}

				const text = formatGuidelines(guidelines);
				return {
					content: [{ type: 'text' as const, text }],
				};
			} catch (error) {
				return errorToMCPContent(error);
			}
		},
	);
}
