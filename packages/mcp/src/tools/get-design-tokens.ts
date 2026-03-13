import type { McpServer } from 'tmcp';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { errorToMCPContent, getManifests } from '../utils/get-manifest.ts';
import type { StorybookContext } from '../types.ts';

export const GET_DESIGN_TOKENS_TOOL_NAME = 'get-design-tokens';

type ColorToken = {
	name: string;
	value: string;
};

type TypographyToken = {
	name: string;
	fontFamily: string;
	fontWeight: string;
};

type TokenBlock = {
	selector: string;
	properties: Array<{ name: string; value: string }>;
};

type DesignTokens = {
	colors: ColorToken[];
	typography: TypographyToken[];
	other: TokenBlock[];
	sourceFiles: string[];
};

/**
 * Rank a color value format. Higher is more preferred.
 * oklch > hsl/hsla > hex > everything else.
 */
function colorFormatRank(value: string): number {
	const v = value.toLowerCase();
	if (v.startsWith('oklch(')) return 3;
	if (v.startsWith('hsl(') || v.startsWith('hsla(')) return 2;
	if (v.startsWith('#')) return 1;
	return 0;
}

/**
 * Parse CSS content and extract custom properties grouped by selector block.
 */
function parseCSSCustomProperties(css: string, filePath: string): {
	blocks: TokenBlock[];
	sourceFile: string;
} {
	const blocks: TokenBlock[] = [];
	const blockRegex = /([^{}]+)\{([^{}]*)\}/g;

	let match;
	while ((match = blockRegex.exec(css)) !== null) {
		const selector = match[1].trim();
		const body = match[2];

		const properties: Array<{ name: string; value: string }> = [];
		const propRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
		let propMatch;
		while ((propMatch = propRegex.exec(body)) !== null) {
			properties.push({
				name: propMatch[1],
				value: propMatch[2].trim(),
			});
		}

		if (properties.length > 0) {
			blocks.push({ selector, properties });
		}
	}

	return { blocks, sourceFile: filePath };
}

const COLOR_NAME_PATTERN = /color|bg|background|shadow|border-color|fill|stroke/i;
const FONT_FAMILY_PATTERN = /font-family|font(?!.*(?:size|weight|style|variant|stretch))/i;
const FONT_WEIGHT_PATTERN = /font-weight|weight/i;

function categorizeTokens(blocks: TokenBlock[]): {
	colors: ColorToken[];
	typography: TypographyToken[];
	other: TokenBlock[];
} {
	const colorMap = new Map<string, ColorToken>();
	const typographyMap = new Map<string, TypographyToken>();
	const other: TokenBlock[] = [];

	for (const block of blocks) {
		const otherProps: Array<{ name: string; value: string }> = [];

		for (const prop of block.properties) {
			if (COLOR_NAME_PATTERN.test(prop.name)) {
				const existing = colorMap.get(prop.name);
				if (!existing || colorFormatRank(prop.value) > colorFormatRank(existing.value)) {
					colorMap.set(prop.name, { name: prop.name, value: prop.value });
				}
			} else if (FONT_WEIGHT_PATTERN.test(prop.name)) {
				const existing = typographyMap.get(prop.name) ?? { name: prop.name, fontFamily: '', fontWeight: '' };
				existing.fontWeight = prop.value;
				typographyMap.set(prop.name, existing);
			} else if (FONT_FAMILY_PATTERN.test(prop.name)) {
				const existing = typographyMap.get(prop.name) ?? { name: prop.name, fontFamily: '', fontWeight: '' };
				existing.fontFamily = prop.value;
				typographyMap.set(prop.name, existing);
			} else {
				otherProps.push(prop);
			}
		}

		if (otherProps.length > 0) {
			other.push({ selector: block.selector, properties: otherProps });
		}
	}

	return {
		colors: Array.from(colorMap.values()),
		typography: Array.from(typographyMap.values()),
		other,
	};
}

function extractCSSImports(fileContent: string, filePath: string): string[] {
	const imports: string[] = [];
	const importRegex = /import\s+['"]([^'"]+\.css)['"]/g;
	let match;
	while ((match = importRegex.exec(fileContent)) !== null) {
		const importPath = match[1];
		const resolvedPath = path.resolve(path.dirname(filePath), importPath);
		imports.push(resolvedPath);
	}
	return imports;
}

async function findPreviewConfig(configDir: string): Promise<string | undefined> {
	const candidates = ['preview.ts', 'preview.tsx', 'preview.js', 'preview.jsx'];
	for (const candidate of candidates) {
		const fullPath = path.join(configDir, candidate);
		try {
			await fs.access(fullPath);
			return fullPath;
		} catch {
			// not found, try next
		}
	}
	return undefined;
}

async function scanCSSFiles(dir: string): Promise<string[]> {
	const cssFiles: string[] = [];
	try {
		const entries = await fs.readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isFile() && entry.name.endsWith('.css')) {
				cssFiles.push(fullPath);
			} else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
				const nested = await scanCSSFiles(fullPath);
				cssFiles.push(...nested);
			}
		}
	} catch {
		// directory not accessible
	}
	return cssFiles;
}

function formatDesignTokens(tokens: DesignTokens): string {
	const parts: string[] = [];
	parts.push('# Design Tokens');
	parts.push('');

	if (tokens.colors.length > 0) {
		parts.push('## Colors');
		parts.push('');
		for (const color of tokens.colors) {
			parts.push(`- **${color.name}**: \`${color.value}\``);
		}
		parts.push('');
	}

	if (tokens.typography.length > 0) {
		parts.push('## Typography');
		parts.push('');
		for (const token of tokens.typography) {
			const fields = [`**${token.name}**`];
			if (token.fontFamily) fields.push(`fontFamily: \`${token.fontFamily}\``);
			if (token.fontWeight) fields.push(`fontWeight: \`${token.fontWeight}\``);
			parts.push(`- ${fields.join(' | ')}`);
		}
		parts.push('');
	}

	if (tokens.other.length > 0) {
		parts.push('## Other Tokens');
		parts.push('');
		for (const block of tokens.other) {
			parts.push(`### ${block.selector}`);
			parts.push('');
			for (const prop of block.properties) {
				parts.push(`- **${prop.name}**: \`${prop.value}\``);
			}
			parts.push('');
		}
	}

	if (tokens.sourceFiles.length > 0) {
		parts.push('## Source Files');
		parts.push('');
		for (const file of tokens.sourceFiles) {
			parts.push(`- ${file}`);
		}
	}

	return parts.join('\n').trim();
}

const TOKEN_NAME_PATTERN = /tokens?/i;

function isTokenEntry(id: string, title: string): boolean {
	return TOKEN_NAME_PATTERN.test(id) || TOKEN_NAME_PATTERN.test(title);
}

/**
 * Fallback: search the component and docs manifests for entries with "token(s)" in their ID or title.
 */
async function findTokenComponentsFallback(
	server: McpServer<any, StorybookContext>,
): Promise<string | undefined> {
	try {
		const ctx = server.ctx.custom;
		const { request, manifestProvider } = ctx ?? {};

		const { componentManifest, docsManifest } = await getManifests(request, manifestProvider);

		const parts: string[] = [];

		if (docsManifest) {
			for (const doc of Object.values(docsManifest.docs)) {
				if (isTokenEntry(doc.id, doc.title)) {
					parts.push(`## ${doc.title}`);
					parts.push('');
					parts.push(doc.content);
					parts.push('');
				}
			}
		}

		for (const component of Object.values(componentManifest.components)) {
			if (isTokenEntry(component.id, component.name)) {
				parts.push(`## ${component.name}`);
				parts.push('');
				if (component.description) {
					parts.push(component.description);
					parts.push('');
				}
				if (component.docs) {
					for (const doc of Object.values(component.docs)) {
						if (doc.content.trim().length > 0) {
							parts.push(doc.content);
							parts.push('');
						}
					}
				}
			}
		}

		if (parts.length === 0) {
			return undefined;
		}

		return ['# Design Tokens', '', ...parts].join('\n').trim();
	} catch {
		return undefined;
	}
}

export async function addGetDesignTokensTool(
	server: McpServer<any, StorybookContext>,
	enabled?: Parameters<McpServer<any, StorybookContext>['tool']>[0]['enabled'],
) {
	server.tool(
		{
			name: GET_DESIGN_TOKENS_TOOL_NAME,
			title: 'Get Design Tokens',
			description: `Returns design tokens (colors, typography, spacing, and other CSS custom properties) extracted from the Storybook project's CSS files and preview configuration.

Scans the project's theme/token CSS files for CSS custom properties and categorizes them into colors, typography, and other tokens. Useful for understanding the design system's visual foundation.`,
			enabled,
		},
		async () => {
			try {
				const ctx = server.ctx.custom;
				const configDir = ctx?.configDir;

				const allBlocks: TokenBlock[] = [];
				const sourceFiles: string[] = [];

				if (configDir) {
					const previewPath = await findPreviewConfig(configDir);
					if (previewPath) {
						const previewContent = await fs.readFile(previewPath, 'utf-8');
						const cssImports = extractCSSImports(previewContent, previewPath);

						for (const cssPath of cssImports) {
							try {
								const css = await fs.readFile(cssPath, 'utf-8');
								const { blocks, sourceFile } = parseCSSCustomProperties(css, cssPath);
								if (blocks.length > 0) {
									allBlocks.push(...blocks);
									sourceFiles.push(sourceFile);
								}
							} catch {
								// CSS file not readable, skip
							}
						}
					}

					const projectRoot = path.dirname(configDir);
					const tokenFilePatterns = [
						'tokens.css',
						'colors.css',
						'variables.css',
						'globals.css',
						'global.css',
						'theme.css',
						'design-tokens.css',
					];

					const allCSS = await scanCSSFiles(projectRoot);
					for (const cssPath of allCSS) {
						if (sourceFiles.includes(cssPath)) continue;
						const basename = path.basename(cssPath).toLowerCase();
						if (tokenFilePatterns.includes(basename)) {
							try {
								const css = await fs.readFile(cssPath, 'utf-8');
								const { blocks, sourceFile } = parseCSSCustomProperties(css, cssPath);
								if (blocks.length > 0) {
									allBlocks.push(...blocks);
									sourceFiles.push(sourceFile);
								}
							} catch {
								// skip unreadable
							}
						}
					}
				}

				if (allBlocks.length === 0) {
					const fallback = await findTokenComponentsFallback(server);
					if (fallback) {
						return {
							content: [{ type: 'text' as const, text: fallback }],
						};
					}

					return {
						content: [
							{
								type: 'text' as const,
								text: 'No design tokens found. This tool looks for CSS custom properties (--var-name) in CSS files imported by the Storybook preview config and in token-named CSS files (theme.css, tokens.css, variables.css, etc.) in the project.',
							},
						],
					};
				}

				const categorized = categorizeTokens(allBlocks);
				const tokens: DesignTokens = { ...categorized, sourceFiles };
				const text = formatDesignTokens(tokens);

				return {
					content: [{ type: 'text' as const, text }],
				};
			} catch (error) {
				return errorToMCPContent(error);
			}
		},
	);
}
