import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from 'tmcp';
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import {
	addReadComponentCodeTool,
	READ_COMPONENT_CODE_TOOL_NAME,
} from './read-component-code.ts';
import type { StorybookContext } from '../types.ts';
import smallManifestFixture from '../../fixtures/small-manifest.fixture.json' with { type: 'json' };
import * as getManifest from '../utils/get-manifest.ts';

describe('readComponentCodeTool', () => {
	let server: McpServer<any, StorybookContext>;
	let getManifestsSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(async () => {
		const adapter = new ValibotJsonSchemaAdapter();
		server = new McpServer(
			{
				name: 'test-server',
				version: '1.0.0',
				description: 'Test server for read component code tool',
			},
			{
				adapter,
				capabilities: {
					tools: { listChanged: true },
				},
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
		await addReadComponentCodeTool(server);

		getManifestsSpy = vi.spyOn(getManifest, 'getManifests');
		getManifestsSpy.mockResolvedValue({
			componentManifest: smallManifestFixture,
		});
	});

	it('should return component source code by componentId using docgen filePath', async () => {
		const mockCode = 'export const Button = () => <button>Click me</button>;';
		const fileReader = vi.fn().mockResolvedValue(mockCode);
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { componentId: 'button' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: {
				request: mockHttpRequest,
				fileReader,
			},
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('# Button');
		expect(result.content[0].text).toContain('File: src/components/Button.tsx');
		expect(result.content[0].text).not.toContain('stories');
		expect(result.content[0].text).toContain(mockCode);
		expect(fileReader).toHaveBeenCalledWith('src/components/Button.tsx');
	});

	it('should return component source code by storyId using docgen filePath', async () => {
		const mockCode = 'export const Card = () => <div>Card</div>;';
		const fileReader = vi.fn().mockResolvedValue(mockCode);
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { storyId: 'card--basic' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: {
				request: mockHttpRequest,
				fileReader,
			},
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('# Card');
		expect(result.content[0].text).toContain('File: src/components/Card.tsx');
		expect(result.content[0].text).not.toContain('stories');
		expect(result.content[0].text).toContain(mockCode);
		expect(fileReader).toHaveBeenCalledWith('src/components/Card.tsx');
	});

	it('should resolve component by case-insensitive ID', async () => {
		const mockCode = 'export const Button = () => <button>Click me</button>;';
		const fileReader = vi.fn().mockResolvedValue(mockCode);
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { componentId: 'Button' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: { request: mockHttpRequest, fileReader },
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('# Button');
		expect(result.content[0].text).toContain(mockCode);
		expect(fileReader).toHaveBeenCalledWith('src/components/Button.tsx');
	});

	it('should resolve component by name when ID does not match', async () => {
		getManifestsSpy.mockResolvedValue({
			componentManifest: {
				v: 1,
				components: {
					'components-actionbar': {
						id: 'components-actionbar',
						name: 'ActionBar',
						path: 'src/stories/ActionBar.stories.tsx',
						stories: [],
						reactDocgenTypescript: {
							displayName: 'ActionBar',
							filePath: 'src/components/ActionBar/index.ts',
							description: '',
							methods: [],
							props: {},
						},
					},
				},
			},
		});

		const mockCode = 'export const ActionBar = () => <div>ActionBar</div>;';
		const fileReader = vi.fn().mockResolvedValue(mockCode);
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { componentId: 'ActionBar' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: { request: mockHttpRequest, fileReader },
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('# ActionBar');
		expect(result.content[0].text).toContain(mockCode);
		expect(fileReader).toHaveBeenCalledWith('src/components/ActionBar/index.ts');
	});

	it('should resolve component by case-insensitive name', async () => {
		const mockCode = 'export const Card = () => <div>Card</div>;';
		const fileReader = vi.fn().mockResolvedValue(mockCode);
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { componentId: 'card' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: { request: mockHttpRequest, fileReader },
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('# Card');
		expect(result.content[0].text).toContain(mockCode);
	});

	it('should return error when componentId is not found', async () => {
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { componentId: 'nonexistent' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: { request: mockHttpRequest },
		});

		const result = response.result as { content: Array<{ text: string }>; isError: boolean };
		expect(result.isError).toBe(true);
		expect(result.content[0].text).toContain('Component not found: "nonexistent"');
	});

	it('should return error when storyId is not found', async () => {
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { storyId: 'nonexistent--story' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: { request: mockHttpRequest },
		});

		const result = response.result as { content: Array<{ text: string }>; isError: boolean };
		expect(result.isError).toBe(true);
		expect(result.content[0].text).toContain('No component found for story ID "nonexistent--story"');
	});

	it('should derive component path from story path when no docgen metadata is available', async () => {
		getManifestsSpy.mockResolvedValue({
			componentManifest: {
				v: 1,
				components: {
					widget: {
						id: 'widget',
						name: 'Widget',
						path: 'src/stories/Widget.stories.tsx',
						stories: [],
					},
				},
			},
		});

		const componentCode = 'export const Widget = () => <div>Widget</div>;';
		const fileReader = vi.fn().mockImplementation((path: string) => {
			if (path === 'src/stories/Widget.tsx') return Promise.resolve(componentCode);
			return Promise.resolve(undefined);
		});
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { componentId: 'widget' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: { request: mockHttpRequest, fileReader },
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('# Widget');
		expect(result.content[0].text).toContain('File: src/stories/Widget.tsx');
		expect(result.content[0].text).toContain(componentCode);
		expect(fileReader).toHaveBeenCalledWith('src/stories/Widget.tsx');
	});

	it('should fall back to story path when derived component path does not exist', async () => {
		getManifestsSpy.mockResolvedValue({
			componentManifest: {
				v: 1,
				components: {
					widget: {
						id: 'widget',
						name: 'Widget',
						path: 'src/stories/Widget.stories.tsx',
						stories: [],
					},
				},
			},
		});

		const storyCode = 'export default { title: "Widget" };';
		const fileReader = vi.fn().mockImplementation((path: string) => {
			if (path === 'src/stories/Widget.stories.tsx') return Promise.resolve(storyCode);
			return Promise.resolve(undefined);
		});
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { componentId: 'widget' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: { request: mockHttpRequest, fileReader },
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('# Widget');
		expect(result.content[0].text).toContain('File: src/stories/Widget.stories.tsx');
		expect(result.content[0].text).toContain(storyCode);
	});

	it('should return error when fileReader is not available', async () => {
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { componentId: 'button' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: { request: mockHttpRequest },
		});

		const result = response.result as { content: Array<{ text: string }>; isError: boolean };
		expect(result.isError).toBe(true);
		expect(result.content[0].text).toContain('file reading is not available');
	});

	it('should return error when file cannot be read', async () => {
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { componentId: 'button' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: {
				request: mockHttpRequest,
				fileReader: vi.fn().mockResolvedValue(undefined),
			},
		});

		const result = response.result as { content: Array<{ text: string }>; isError: boolean };
		expect(result.isError).toBe(true);
		expect(result.content[0].text).toContain('Could not read source file');
	});

	it('should include story HTML when storyHtmlFetcher is provided and storyId is given', async () => {
		const mockCode = 'export const Button = () => <button>Click me</button>;';
		const mockHtml = '<button class="btn-primary">Click me</button>';
		const fileReader = vi.fn().mockResolvedValue(mockCode);
		const storyHtmlFetcher = vi.fn().mockResolvedValue(mockHtml);
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { storyId: 'button--primary' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: {
				request: mockHttpRequest,
				fileReader,
				storyHtmlFetcher,
			},
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('# Button');
		expect(result.content[0].text).toContain(mockCode);
		expect(result.content[0].text).toContain('## Story HTML (button--primary)');
		expect(result.content[0].text).toContain(mockHtml);
		expect(storyHtmlFetcher).toHaveBeenCalledWith('button--primary');
	});

	it('should pick first story with an ID when componentId is given and storyHtmlFetcher is provided', async () => {
		const mockCode = 'export const Button = () => <button>Click me</button>;';
		const mockHtml = '<button class="btn-primary">Click me</button>';
		const fileReader = vi.fn().mockResolvedValue(mockCode);
		const storyHtmlFetcher = vi.fn().mockResolvedValue(mockHtml);
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { componentId: 'button' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: {
				request: mockHttpRequest,
				fileReader,
				storyHtmlFetcher,
			},
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('## Story HTML (button--primary)');
		expect(result.content[0].text).toContain(mockHtml);
		expect(storyHtmlFetcher).toHaveBeenCalledWith('button--primary');
	});

	it('should omit story HTML when storyHtmlFetcher is not provided', async () => {
		const mockCode = 'export const Button = () => <button>Click me</button>;';
		const fileReader = vi.fn().mockResolvedValue(mockCode);
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { componentId: 'button' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: {
				request: mockHttpRequest,
				fileReader,
			},
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('# Button');
		expect(result.content[0].text).toContain(mockCode);
		expect(result.content[0].text).not.toContain('## Story HTML');
	});

	it('should omit story HTML when storyHtmlFetcher returns undefined', async () => {
		const mockCode = 'export const Button = () => <button>Click me</button>;';
		const fileReader = vi.fn().mockResolvedValue(mockCode);
		const storyHtmlFetcher = vi.fn().mockResolvedValue(undefined);
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { storyId: 'button--primary' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: {
				request: mockHttpRequest,
				fileReader,
				storyHtmlFetcher,
			},
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('# Button');
		expect(result.content[0].text).not.toContain('## Story HTML');
	});

	it('should not fail when storyHtmlFetcher throws', async () => {
		const mockCode = 'export const Button = () => <button>Click me</button>;';
		const fileReader = vi.fn().mockResolvedValue(mockCode);
		const storyHtmlFetcher = vi.fn().mockRejectedValue(new Error('fetch failed'));
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { storyId: 'button--primary' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: {
				request: mockHttpRequest,
				fileReader,
				storyHtmlFetcher,
			},
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('# Button');
		expect(result.content[0].text).toContain(mockCode);
		expect(result.content[0].text).not.toContain('## Story HTML');
	});

	it('should omit story HTML when component has no stories with IDs', async () => {
		getManifestsSpy.mockResolvedValue({
			componentManifest: {
				v: 1,
				components: {
					widget: {
						id: 'widget',
						name: 'Widget',
						path: 'src/stories/Widget.stories.tsx',
						stories: [{ name: 'Default' }],
						reactDocgenTypescript: {
							displayName: 'Widget',
							filePath: 'src/components/Widget.tsx',
							description: '',
							methods: [],
							props: {},
						},
					},
				},
			},
		});

		const mockCode = 'export const Widget = () => <div>Widget</div>;';
		const fileReader = vi.fn().mockResolvedValue(mockCode);
		const storyHtmlFetcher = vi.fn();
		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { componentId: 'widget' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: {
				request: mockHttpRequest,
				fileReader,
				storyHtmlFetcher,
			},
		});

		const result = response.result as { content: Array<{ text: string }> };
		expect(result.content[0].text).toContain('# Widget');
		expect(result.content[0].text).not.toContain('## Story HTML');
		expect(storyHtmlFetcher).not.toHaveBeenCalled();
	});

	it('should handle manifest fetch errors gracefully', async () => {
		getManifestsSpy.mockRejectedValue(
			new getManifest.ManifestGetError(
				'Failed to fetch manifest: 404 Not Found',
				'https://example.com/manifest.json',
			),
		);

		const request = {
			jsonrpc: '2.0' as const,
			id: 1,
			method: 'tools/call',
			params: {
				name: READ_COMPONENT_CODE_TOOL_NAME,
				arguments: { componentId: 'button' },
			},
		};

		const mockHttpRequest = new Request('https://example.com/mcp');
		const response = await server.receive(request, {
			custom: { request: mockHttpRequest },
		});

		const result = response.result as { content: Array<{ text: string }>; isError: boolean };
		expect(result.isError).toBe(true);
		expect(result.content[0].text).toContain('Error getting manifest');
	});

	describe('multi-source mode', () => {
		const sources = [
			{ id: 'local', title: 'Local' },
			{ id: 'remote', title: 'Remote', url: 'http://remote.example.com' },
		];

		const remoteManifest = {
			v: 1,
			components: {
				badge: {
					id: 'badge',
					path: 'src/stories/Badge.stories.tsx',
					name: 'Badge',
					stories: [{ id: 'badge--default', name: 'Default', snippet: '<Badge />' }],
					reactDocgenTypescript: {
						displayName: 'Badge',
						filePath: 'src/components/Badge.tsx',
						description: '',
						methods: [],
						props: {},
					},
				},
			},
		};

		beforeEach(async () => {
			const adapter = new ValibotJsonSchemaAdapter();
			server = new McpServer(
				{
					name: 'test-server',
					version: '1.0.0',
					description: 'Test server for read component code tool',
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
			await addReadComponentCodeTool(server, undefined, { multiSource: true });

			getManifestsSpy = vi.spyOn(getManifest, 'getManifests');
			getManifestsSpy.mockResolvedValue({
				componentManifest: smallManifestFixture,
			});
		});

		it('should return schema validation error when storybookId is missing', async () => {
			const request = {
				jsonrpc: '2.0' as const,
				id: 1,
				method: 'tools/call',
				params: {
					name: READ_COMPONENT_CODE_TOOL_NAME,
					arguments: { componentId: 'button' },
				},
			};

			const mockHttpRequest = new Request('https://example.com/mcp');
			const response = await server.receive(request, {
				custom: { request: mockHttpRequest, sources },
			});

			expect((response.result as { isError: boolean }).isError).toBe(true);
			expect((response.result as { content: Array<{ text: string }> }).content[0].text).toContain(
				'storybookId',
			);
		});

		it('should return error when storybookId is invalid', async () => {
			const request = {
				jsonrpc: '2.0' as const,
				id: 1,
				method: 'tools/call',
				params: {
					name: READ_COMPONENT_CODE_TOOL_NAME,
					arguments: { componentId: 'button', storybookId: 'nonexistent' },
				},
			};

			const mockHttpRequest = new Request('https://example.com/mcp');
			const response = await server.receive(request, {
				custom: { request: mockHttpRequest, sources },
			});

			const result = response.result as { content: Array<{ text: string }>; isError: boolean };
			expect(result.isError).toBe(true);
			expect(result.content[0].text).toContain('Storybook source not found: "nonexistent"');
		});

		it('should resolve component from correct source', async () => {
			getManifestsSpy.mockImplementation((_req: unknown, _provider: unknown, source?: { id: string }) => {
				if (source?.id === 'remote') {
					return Promise.resolve({ componentManifest: remoteManifest });
				}
				return Promise.resolve({ componentManifest: smallManifestFixture });
			});

			const mockCode = 'export const Badge = () => <span>Badge</span>;';
			const request = {
				jsonrpc: '2.0' as const,
				id: 1,
				method: 'tools/call',
				params: {
					name: READ_COMPONENT_CODE_TOOL_NAME,
					arguments: { componentId: 'badge', storybookId: 'remote' },
				},
			};

			const mockHttpRequest = new Request('https://example.com/mcp');
			const response = await server.receive(request, {
				custom: {
					request: mockHttpRequest,
					sources,
					fileReader: vi.fn().mockResolvedValue(mockCode),
				},
			});

			const result = response.result as { content: Array<{ text: string }> };
			expect(result.content[0].text).toContain('# Badge');
			expect(result.content[0].text).toContain(mockCode);
		});
	});
});
