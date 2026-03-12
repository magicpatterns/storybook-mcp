import type { McpServer } from 'tmcp';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { collectTelemetry } from '../telemetry.ts';
import { errorToMCPContent } from '../utils/errors.ts';
import type { AddonContext } from '../types.ts';
import { GET_DESIGN_GUIDELINES_TOOL_NAME } from './tool-names.ts';

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
 * Check if a filename (without extension) matches a guideline-like name.
 */
function isGuidelineFile(filename: string): boolean {
	const name = filename.replace(/\.(mdx|md)$/i, '').toLowerCase();
	return GUIDELINE_NAME_PATTERNS.some(
		(pattern) => name === pattern || name.startsWith(`${pattern}-`) || name.endsWith(`-${pattern}`),
	);
}

/**
 * Check if an MDX file is a standalone doc (not component-attached).
 * Component-attached MDX typically imports a stories file and uses <Meta of={...} />.
 */
function isStandaloneDoc(content: string): boolean {
	const hasMetaOfPattern = /Meta\s+of=\{/.test(content);
	return !hasMetaOfPattern;
}

/**
 * Extract a title from MDX/markdown content.
 */
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

/**
 * Resolve story directories from Storybook config.
 * Stories can be strings (globs) or objects with a directory property.
 */
function resolveStoryDirs(stories: unknown[], configDir: string): string[] {
	const dirs = new Set<string>();
	for (const entry of stories) {
		if (typeof entry === 'string') {
			// Extract directory portion from glob (e.g. "../stories/**/*.mdx" -> "../stories")
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

export async function addGetDesignGuidelinesTool(server: McpServer<any, AddonContext>) {
	server.tool(
		{
			name: GET_DESIGN_GUIDELINES_TOOL_NAME,
			title: 'Get Design Guidelines',
			description: `Returns design guidelines and foundational documentation from the Storybook project.

Scans the project's story directories for standalone MDX/Markdown files that contain introductory content, theming guides, design principles, and other foundational documentation. Returns the content of files matching guideline-like names (e.g., getting-started, theming, foundations, guidelines, overview).`,
			enabled: () => server.ctx.custom?.toolsets?.docs ?? true,
		},
		async () => {
			try {
				const { options, disableTelemetry } = server.ctx.custom ?? {};
				if (!options) {
					throw new Error('Options are required in addon context');
				}

				if (!disableTelemetry) {
					await collectTelemetry({
						event: 'tool:getDesignGuidelines',
						server,
						toolset: 'docs',
					});
				}

				const configDir = options.configDir ?? path.join(process.cwd(), '.storybook');

				// Get story directories from Storybook config
				let storyDirs: string[] = [];
				try {
					const storiesConfig = await options.presets.apply('stories', []);
					if (Array.isArray(storiesConfig)) {
						storyDirs = resolveStoryDirs(storiesConfig, configDir);
					}
				} catch {
					// Fall back to scanning the config dir's parent
					storyDirs = [path.dirname(configDir)];
				}

				if (storyDirs.length === 0) {
					storyDirs = [path.dirname(configDir)];
				}

				const guidelines: GuidelineEntry[] = [];
				const seen = new Set<string>();

				for (const dir of storyDirs) {
					const mdxFiles = await scanForMDXFiles(dir);
					for (const filePath of mdxFiles) {
						if (seen.has(filePath)) continue;
						seen.add(filePath);

						const basename = path.basename(filePath);
						if (!isGuidelineFile(basename)) continue;

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

				if (guidelines.length === 0) {
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
