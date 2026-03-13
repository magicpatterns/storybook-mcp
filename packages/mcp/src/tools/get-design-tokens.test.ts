import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from 'tmcp';
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { addGetDesignTokensTool, GET_DESIGN_TOKENS_TOOL_NAME } from './get-design-tokens.ts';
import type { StorybookContext } from '../types.ts';

vi.mock('node:fs/promises', () => ({
	readFile: vi.fn(),
	readdir: vi.fn(),
	access: vi.fn(),
}));

describe('getDesignTokensTool', () => {
	let server: McpServer<any, StorybookContext>;

	beforeEach(async () => {
		vi.clearAllMocks();
		const adapter = new ValibotJsonSchemaAdapter();
		server = new McpServer(
			{
				name: 'test-server',
				version: '1.0.0',
				description: 'Test server for design tokens tool',
			},
			{
				adapter,
				capabilities: { tools: { listChanged: true } },
			},
		).withContext<StorybookContext>();

		await server.receive(
			{
				jsonrpc: '2.0',
				id: 1,
				method: 'initialize',
				params: {
					protocolVersion: '2025-06-18',
					capabilities: {},
					clientInfo: { name: 'test', version: '1.0.0' },
				},
			},
			{ sessionId: 'test-session' },
		);

		await addGetDesignTokensTool(server);
	});

	it('should register the tool with the correct name', async () => {
		const tools = await server.receive(
			{
				jsonrpc: '2.0' as const,
				id: 2,
				method: 'tools/list',
				params: {},
			},
			{ custom: {} },
		);

		const toolNames = (tools.result as { tools: Array<{ name: string }> }).tools.map(
			(t) => t.name,
		);
		expect(toolNames).toContain(GET_DESIGN_TOKENS_TOOL_NAME);
	});

	it('should return tokens from CSS files imported by preview config', async () => {
		const fs = await import('node:fs/promises');

		vi.mocked(fs.access).mockResolvedValueOnce(undefined);
		vi.mocked(fs.readFile).mockImplementation(async (filePath: any) => {
			if (filePath.toString().endsWith('preview.ts')) {
				return "import '../stories/theme.css';";
			}
			if (filePath.toString().endsWith('theme.css')) {
				return `:root {
	--color-primary: #1ea7fd;
	--color-text: #333333;
	--font-family: 'Inter', sans-serif;
}`;
			}
			throw new Error('not found');
		});
		vi.mocked(fs.readdir).mockResolvedValue([] as any);

		const response = await server.receive(
			{
				jsonrpc: '2.0' as const,
				id: 3,
				method: 'tools/call',
				params: { name: GET_DESIGN_TOKENS_TOOL_NAME, arguments: {} },
			},
			{ custom: { configDir: '/project/.storybook' } },
		);

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('# Design Tokens');
		expect(result.content[0].text).toContain('**--color-primary**: `#1ea7fd`');
		expect(result.content[0].text).toContain('**--color-text**: `#333333`');
	});

	it('should return message when no tokens are found and no manifest available', async () => {
		const fs = await import('node:fs/promises');

		vi.mocked(fs.access).mockRejectedValue(new Error('not found'));
		vi.mocked(fs.readdir).mockResolvedValue([] as any);

		const response = await server.receive(
			{
				jsonrpc: '2.0' as const,
				id: 3,
				method: 'tools/call',
				params: { name: GET_DESIGN_TOKENS_TOOL_NAME, arguments: {} },
			},
			{ custom: { configDir: '/project/.storybook' } },
		);

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('No design tokens found');
	});

	it('should categorize tokens into colors, typography, and other', async () => {
		const fs = await import('node:fs/promises');

		vi.mocked(fs.access).mockResolvedValueOnce(undefined);
		vi.mocked(fs.readFile).mockImplementation(async (filePath: any) => {
			if (filePath.toString().endsWith('preview.ts')) {
				return "import '../theme.css';";
			}
			if (filePath.toString().endsWith('theme.css')) {
				return `:root {
	--color-primary: #1ea7fd;
	--font-family: 'Inter', sans-serif;
	--font-weight: 700;
	--font-size-base: 16px;
	--spacing-md: 1rem;
}`;
			}
			throw new Error('not found');
		});
		vi.mocked(fs.readdir).mockResolvedValue([] as any);

		const response = await server.receive(
			{
				jsonrpc: '2.0' as const,
				id: 3,
				method: 'tools/call',
				params: { name: GET_DESIGN_TOKENS_TOOL_NAME, arguments: {} },
			},
			{ custom: { configDir: '/project/.storybook' } },
		);

		const result = response.result as { content: Array<{ text: string }> };
		const text = result.content[0].text;
		expect(text).toContain('## Colors');
		expect(text).toContain('--color-primary');
		expect(text).toContain('## Typography');
		expect(text).toContain("fontFamily: `'Inter', sans-serif`");
		expect(text).toContain('fontWeight: `700`');
		expect(text).toContain('## Other Tokens');
		expect(text).toContain('--spacing-md');
		expect(text).toContain('--font-size-base');
	});

	it('should prefer oklch over hsl over hex when the same token appears in multiple blocks', async () => {
		const fs = await import('node:fs/promises');

		vi.mocked(fs.access).mockResolvedValueOnce(undefined);
		vi.mocked(fs.readFile).mockImplementation(async (filePath: any) => {
			if (filePath.toString().endsWith('preview.ts')) {
				return "import '../theme.css';";
			}
			if (filePath.toString().endsWith('theme.css')) {
				return `:root {
	--color-primary: #1ea7fd;
}
.dark {
	--color-primary: oklch(0.7 0.15 200);
}`;
			}
			throw new Error('not found');
		});
		vi.mocked(fs.readdir).mockResolvedValue([] as any);

		const response = await server.receive(
			{
				jsonrpc: '2.0' as const,
				id: 3,
				method: 'tools/call',
				params: { name: GET_DESIGN_TOKENS_TOOL_NAME, arguments: {} },
			},
			{ custom: { configDir: '/project/.storybook' } },
		);

		const result = response.result as { content: Array<{ text: string }> };
		const text = result.content[0].text;
		expect(text).toContain('**--color-primary**: `oklch(0.7 0.15 200)`');
		expect(text).not.toContain('#1ea7fd');
	});

	it('should skip filesystem scan when configDir is not provided', async () => {
		const response = await server.receive(
			{
				jsonrpc: '2.0' as const,
				id: 3,
				method: 'tools/call',
				params: { name: GET_DESIGN_TOKENS_TOOL_NAME, arguments: {} },
			},
			{ custom: {} },
		);

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('No design tokens found');
	});

	it('should fall back to docs manifest entries with "token" in the id', async () => {
		const fs = await import('node:fs/promises');

		vi.mocked(fs.access).mockRejectedValue(new Error('not found'));
		vi.mocked(fs.readdir).mockResolvedValue([] as any);

		const mockManifestProvider = vi.fn().mockImplementation(async (_req: any, path: string) => {
			if (path.includes('components')) {
				return JSON.stringify({
					v: 1,
					components: {
						button: { id: 'button', name: 'Button', path: 'src/Button.tsx' },
					},
				});
			}
			return JSON.stringify({
				v: 1,
				docs: {
					'guidelines-color-tokens': {
						id: 'guidelines-color-tokens',
						name: 'Color Tokens',
						title: 'Guidelines/Color Tokens',
						path: 'guidelines/color-tokens.md',
						content: '## Brand Colors\n\n- Primary: #1ea7fd\n- Secondary: #ff4785',
					},
				},
			});
		});

		const response = await server.receive(
			{
				jsonrpc: '2.0' as const,
				id: 3,
				method: 'tools/call',
				params: { name: GET_DESIGN_TOKENS_TOOL_NAME, arguments: {} },
			},
			{
				custom: {
					configDir: '/project/.storybook',
					manifestProvider: mockManifestProvider,
				},
			},
		);

		const result = response.result as { content: Array<{ text: string }> };
		const text = result.content[0].text;
		expect(text).toContain('# Design Tokens');
		expect(text).toContain('Guidelines/Color Tokens');
		expect(text).toContain('Primary: #1ea7fd');
	});

	it('should fall back to component manifest entries with "token" in the id', async () => {
		const fs = await import('node:fs/promises');

		vi.mocked(fs.access).mockRejectedValue(new Error('not found'));
		vi.mocked(fs.readdir).mockResolvedValue([] as any);

		const mockManifestProvider = vi.fn().mockImplementation(async (_req: any, path: string) => {
			if (path.includes('components')) {
				return JSON.stringify({
					v: 1,
					components: {
						'color-tokens': {
							id: 'color-tokens',
							name: 'ColorTokens',
							path: 'src/tokens/ColorTokens.tsx',
							description: 'Displays all brand color tokens',
							docs: {
								'color-tokens--docs': {
									id: 'color-tokens--docs',
									name: 'Docs',
									title: 'Color Tokens',
									path: 'src/tokens/ColorTokens.mdx',
									content: '## Palette\n\n- Blue: #0066cc\n- Red: #cc0000',
								},
							},
						},
						button: {
							id: 'button',
							name: 'Button',
							path: 'src/components/Button.tsx',
							description: 'A button component',
						},
					},
				});
			}
			return JSON.stringify({ v: 1, docs: {} });
		});

		const response = await server.receive(
			{
				jsonrpc: '2.0' as const,
				id: 3,
				method: 'tools/call',
				params: { name: GET_DESIGN_TOKENS_TOOL_NAME, arguments: {} },
			},
			{
				custom: {
					configDir: '/project/.storybook',
					manifestProvider: mockManifestProvider,
				},
			},
		);

		const result = response.result as { content: Array<{ text: string }> };
		const text = result.content[0].text;
		expect(text).toContain('# Design Tokens');
		expect(text).toContain('ColorTokens');
		expect(text).toContain('Displays all brand color tokens');
		expect(text).toContain('Blue: #0066cc');
		expect(text).not.toContain('Button');
	});
});
