import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from 'tmcp';
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { addGetDesignGuidelinesTool, GET_DESIGN_GUIDELINES_TOOL_NAME } from './get-design-guidelines.ts';
import type { StorybookContext } from '../types.ts';

vi.mock('node:fs/promises', () => ({
	readFile: vi.fn(),
	readdir: vi.fn(),
}));

describe('getDesignGuidelinesTool', () => {
	let server: McpServer<any, StorybookContext>;

	beforeEach(async () => {
		vi.clearAllMocks();
		const adapter = new ValibotJsonSchemaAdapter();
		server = new McpServer(
			{
				name: 'test-server',
				version: '1.0.0',
				description: 'Test server for design guidelines tool',
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

		await addGetDesignGuidelinesTool(server);
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
		expect(toolNames).toContain(GET_DESIGN_GUIDELINES_TOOL_NAME);
	});

	it('should return guidelines from standalone MDX files', async () => {
		const fs = await import('node:fs/promises');

		const storiesResolver = vi.fn().mockResolvedValue(['../stories/**/*.mdx']);

		vi.mocked(fs.readdir).mockImplementation(async (dir: any, _opts?: any) => {
			if (dir.toString().includes('stories')) {
				return [
					{ name: 'getting-started.mdx', isFile: () => true, isDirectory: () => false },
					{ name: 'Button.mdx', isFile: () => true, isDirectory: () => false },
				] as any;
			}
			return [];
		});

		vi.mocked(fs.readFile).mockImplementation(async (filePath: any) => {
			if (filePath.toString().includes('getting-started.mdx')) {
				return '# Getting Started\n\nWelcome to the design system.';
			}
			throw new Error('not found');
		});

		const response = await server.receive(
			{
				jsonrpc: '2.0' as const,
				id: 3,
				method: 'tools/call',
				params: { name: GET_DESIGN_GUIDELINES_TOOL_NAME, arguments: {} },
			},
			{
				custom: {
					configDir: '/project/.storybook',
					storiesResolver,
				},
			},
		);

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('# Design Guidelines');
		expect(result.content[0].text).toContain('Getting Started');
		expect(result.content[0].text).toContain('Welcome to the design system.');
	});

	it('should skip component-attached MDX files', async () => {
		const fs = await import('node:fs/promises');

		const storiesResolver = vi.fn().mockResolvedValue(['../stories/**/*.mdx']);

		vi.mocked(fs.readdir).mockImplementation(async (dir: any, _opts?: any) => {
			if (dir.toString().includes('stories')) {
				return [
					{ name: 'overview.mdx', isFile: () => true, isDirectory: () => false },
				] as any;
			}
			return [];
		});

		vi.mocked(fs.readFile).mockImplementation(async (filePath: any) => {
			if (filePath.toString().includes('overview.mdx')) {
				return `import { Meta } from '@storybook/addon-docs/blocks';
import * as ButtonStories from './Button.stories';

<Meta of={ButtonStories} />

This is attached documentation.`;
			}
			throw new Error('not found');
		});

		const response = await server.receive(
			{
				jsonrpc: '2.0' as const,
				id: 3,
				method: 'tools/call',
				params: { name: GET_DESIGN_GUIDELINES_TOOL_NAME, arguments: {} },
			},
			{
				custom: {
					configDir: '/project/.storybook',
					storiesResolver,
				},
			},
		);

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('No design guidelines found');
	});

	it('should skip filesystem scan when configDir is not provided', async () => {
		const response = await server.receive(
			{
				jsonrpc: '2.0' as const,
				id: 3,
				method: 'tools/call',
				params: { name: GET_DESIGN_GUIDELINES_TOOL_NAME, arguments: {} },
			},
			{ custom: {} },
		);

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('No design guidelines found');
	});

	it('should include all MDX files inside a guideline-named directory', async () => {
		const fs = await import('node:fs/promises');

		const storiesResolver = vi.fn().mockResolvedValue(['../docs/**/*.mdx']);

		vi.mocked(fs.readdir).mockImplementation(async (dir: any, _opts?: any) => {
			const dirStr = dir.toString();
			if (dirStr.endsWith('/docs')) {
				return [
					{ name: 'foundations', isFile: () => false, isDirectory: () => true },
					{ name: 'Button.mdx', isFile: () => true, isDirectory: () => false },
				] as any;
			}
			if (dirStr.endsWith('/foundations')) {
				return [
					{ name: 'colors.mdx', isFile: () => true, isDirectory: () => false },
					{ name: 'spacing.mdx', isFile: () => true, isDirectory: () => false },
					{ name: 'typography.mdx', isFile: () => true, isDirectory: () => false },
				] as any;
			}
			return [];
		});

		vi.mocked(fs.readFile).mockImplementation(async (filePath: any) => {
			const fp = filePath.toString();
			if (fp.includes('colors.mdx')) return '# Colors\n\nBrand color palette.';
			if (fp.includes('spacing.mdx')) return '# Spacing\n\nSpacing scale guide.';
			if (fp.includes('typography.mdx')) return '# Typography\n\nFont usage rules.';
			throw new Error('not found');
		});

		const response = await server.receive(
			{
				jsonrpc: '2.0' as const,
				id: 3,
				method: 'tools/call',
				params: { name: GET_DESIGN_GUIDELINES_TOOL_NAME, arguments: {} },
			},
			{
				custom: {
					configDir: '/project/.storybook',
					storiesResolver,
				},
			},
		);

		const result = response.result as { content: Array<{ text: string }> };
		const text = result.content[0].text;
		expect(text).toContain('# Design Guidelines');
		expect(text).toContain('Colors');
		expect(text).toContain('Brand color palette.');
		expect(text).toContain('Spacing');
		expect(text).toContain('Typography');
	});

	it('should fall back to docs manifest entries matching guideline patterns', async () => {
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
					'foundations-colors': {
						id: 'foundations-colors',
						name: 'Colors',
						title: 'Foundations/Colors',
						path: 'docs/foundations/colors.mdx',
						content: 'Brand color palette with primary and secondary colors.',
					},
					'button': {
						id: 'button',
						name: 'Button',
						title: 'Components/Button',
						path: 'docs/components/button.mdx',
						content: 'Button component docs.',
					},
				},
			});
		});

		const response = await server.receive(
			{
				jsonrpc: '2.0' as const,
				id: 3,
				method: 'tools/call',
				params: { name: GET_DESIGN_GUIDELINES_TOOL_NAME, arguments: {} },
			},
			{
				custom: { manifestProvider: mockManifestProvider },
			},
		);

		const result = response.result as { content: Array<{ text: string }> };
		const text = result.content[0].text;
		expect(text).toContain('# Design Guidelines');
		expect(text).toContain('Foundations/Colors');
		expect(text).toContain('Brand color palette');
		expect(text).not.toContain('Button component docs');
	});

	it('should fall back to component manifest entries matching guideline patterns', async () => {
		const mockManifestProvider = vi.fn().mockImplementation(async (_req: any, path: string) => {
			if (path.includes('components')) {
				return JSON.stringify({
					v: 1,
					components: {
						'getting-started': {
							id: 'getting-started',
							name: 'GettingStarted',
							path: 'src/docs/GettingStarted.tsx',
							description: 'How to install and set up the library',
							docs: {
								'getting-started--docs': {
									id: 'getting-started--docs',
									name: 'Docs',
									title: 'Getting Started',
									path: 'src/docs/GettingStarted.mdx',
									content: '## Installation\n\nnpm install our-lib',
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
				params: { name: GET_DESIGN_GUIDELINES_TOOL_NAME, arguments: {} },
			},
			{
				custom: { manifestProvider: mockManifestProvider },
			},
		);

		const result = response.result as { content: Array<{ text: string }> };
		const text = result.content[0].text;
		expect(text).toContain('# Design Guidelines');
		expect(text).toContain('GettingStarted');
		expect(text).toContain('Installation');
		expect(text).not.toContain('A button component');
	});
});
