import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from 'tmcp';
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { addGetDesignGuidelinesTool } from './get-design-guidelines.ts';
import type { AddonContext } from '../types.ts';
import { GET_DESIGN_GUIDELINES_TOOL_NAME } from './tool-names.ts';

vi.mock('storybook/internal/telemetry', () => ({
	telemetry: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
	readFile: vi.fn(),
	readdir: vi.fn(),
}));

describe('getDesignGuidelinesTool', () => {
	let server: McpServer<any, AddonContext>;

	const mockOptions = {
		configDir: '/project/.storybook',
		presets: {
			apply: vi.fn(),
		},
	};

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
		).withContext<AddonContext>();

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
			{
				custom: {
					options: mockOptions as any,
					origin: 'http://localhost:6006',
					disableTelemetry: true,
				},
			},
		);

		const toolNames = (tools.result as { tools: Array<{ name: string }> }).tools.map(
			(t) => t.name,
		);
		expect(toolNames).toContain(GET_DESIGN_GUIDELINES_TOOL_NAME);
	});

	it('should return guidelines from standalone MDX files', async () => {
		const fs = await import('node:fs/promises');

		mockOptions.presets.apply.mockResolvedValue(['../stories/**/*.mdx']);

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

		const request = {
			jsonrpc: '2.0' as const,
			id: 3,
			method: 'tools/call',
			params: {
				name: GET_DESIGN_GUIDELINES_TOOL_NAME,
				arguments: {},
			},
		};

		const response = await server.receive(request, {
			custom: {
				options: mockOptions as any,
				origin: 'http://localhost:6006',
				disableTelemetry: true,
			},
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('# Design Guidelines');
		expect(result.content[0].text).toContain('Getting Started');
		expect(result.content[0].text).toContain('Welcome to the design system.');
	});

	it('should skip component-attached MDX files', async () => {
		const fs = await import('node:fs/promises');

		mockOptions.presets.apply.mockResolvedValue(['../stories/**/*.mdx']);

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

		const request = {
			jsonrpc: '2.0' as const,
			id: 3,
			method: 'tools/call',
			params: {
				name: GET_DESIGN_GUIDELINES_TOOL_NAME,
				arguments: {},
			},
		};

		const response = await server.receive(request, {
			custom: {
				options: mockOptions as any,
				origin: 'http://localhost:6006',
				disableTelemetry: true,
			},
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('No design guidelines found');
	});

	it('should return message when no guidelines are found', async () => {
		const fs = await import('node:fs/promises');

		mockOptions.presets.apply.mockResolvedValue([]);
		vi.mocked(fs.readdir).mockResolvedValue([] as any);

		const request = {
			jsonrpc: '2.0' as const,
			id: 3,
			method: 'tools/call',
			params: {
				name: GET_DESIGN_GUIDELINES_TOOL_NAME,
				arguments: {},
			},
		};

		const response = await server.receive(request, {
			custom: {
				options: mockOptions as any,
				origin: 'http://localhost:6006',
				disableTelemetry: true,
			},
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('No design guidelines found');
	});

	it('should return error when options are missing', async () => {
		const request = {
			jsonrpc: '2.0' as const,
			id: 3,
			method: 'tools/call',
			params: {
				name: GET_DESIGN_GUIDELINES_TOOL_NAME,
				arguments: {},
			},
		};

		const response = await server.receive(request, {
			custom: {
				origin: 'http://localhost:6006',
				disableTelemetry: true,
			} as any,
		});

		const result = response.result as { content: Array<{ text: string }>; isError: boolean };
		expect(result.isError).toBe(true);
		expect(result.content[0].text).toContain('Options are required');
	});

	it('should handle multiple guideline files', async () => {
		const fs = await import('node:fs/promises');

		mockOptions.presets.apply.mockResolvedValue(['../docs/**/*.mdx']);

		vi.mocked(fs.readdir).mockImplementation(async (dir: any, _opts?: any) => {
			if (dir.toString().includes('docs')) {
				return [
					{ name: 'getting-started.mdx', isFile: () => true, isDirectory: () => false },
					{ name: 'theming.mdx', isFile: () => true, isDirectory: () => false },
				] as any;
			}
			return [];
		});

		vi.mocked(fs.readFile).mockImplementation(async (filePath: any) => {
			if (filePath.toString().includes('getting-started.mdx')) {
				return '# Getting Started\n\nWelcome to the design system.';
			}
			if (filePath.toString().includes('theming.mdx')) {
				return '# Theming Guide\n\nHow to customize the theme.';
			}
			throw new Error('not found');
		});

		const request = {
			jsonrpc: '2.0' as const,
			id: 3,
			method: 'tools/call',
			params: {
				name: GET_DESIGN_GUIDELINES_TOOL_NAME,
				arguments: {},
			},
		};

		const response = await server.receive(request, {
			custom: {
				options: mockOptions as any,
				origin: 'http://localhost:6006',
				disableTelemetry: true,
			},
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('Getting Started');
		expect(result.content[0].text).toContain('Theming Guide');
	});
});
