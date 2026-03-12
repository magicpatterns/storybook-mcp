/**
 * @import { Meta, StoryObj } from '@storybook/react-vite'
 * @summary Typography scale — heading, body, button, caption, and code styles across three font families.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import '../theme.css';

const meta: Meta = {
	title: 'Tokens/Typography',
};

export default meta;

type Story = StoryObj;

type TypographyRow = {
	names: string[];
	fontWeights: number[];
	typeface: string;
	fontWeightDisplay: string;
	fontSize: string;
	lineHeight: string;
	charSpacing: string;
	styles: CSSProperties[];
};

const typographyData: TypographyRow[] = [
	{
		names: ['Heading 1'],
		fontWeights: [700],
		typeface: 'Plus Jakarta Sans',
		fontWeightDisplay: 'Bold-700',
		fontSize: '40px (2.5rem)',
		lineHeight: '115%',
		charSpacing: '0%',
		styles: [
			{
				fontFamily: 'var(--ds-font-heading)',
				fontSize: '2.5rem',
				fontWeight: 700,
				lineHeight: 1.15,
			},
		],
	},
	{
		names: ['Heading 2'],
		fontWeights: [700],
		typeface: 'Plus Jakarta Sans',
		fontWeightDisplay: 'Bold-700',
		fontSize: '36px (2.25rem)',
		lineHeight: '115%',
		charSpacing: '0%',
		styles: [
			{
				fontFamily: 'var(--ds-font-heading)',
				fontSize: '2.25rem',
				fontWeight: 700,
				lineHeight: 1.15,
			},
		],
	},
	{
		names: ['Heading 3'],
		fontWeights: [700],
		typeface: 'Plus Jakarta Sans',
		fontWeightDisplay: 'Bold-700',
		fontSize: '28px (1.75rem)',
		lineHeight: '115%',
		charSpacing: '0%',
		styles: [
			{
				fontFamily: 'var(--ds-font-heading)',
				fontSize: '1.75rem',
				fontWeight: 700,
				lineHeight: 1.15,
			},
		],
	},
	{
		names: ['Heading 4'],
		fontWeights: [700],
		typeface: 'Inter',
		fontWeightDisplay: 'Bold-700',
		fontSize: '24px (1.5rem)',
		lineHeight: '115%',
		charSpacing: '0%',
		styles: [
			{
				fontFamily: 'var(--ds-font-body)',
				fontSize: '1.5rem',
				fontWeight: 700,
				lineHeight: 1.15,
			},
		],
	},
	{
		names: ['Heading 5'],
		fontWeights: [700],
		typeface: 'Inter',
		fontWeightDisplay: 'Bold-700',
		fontSize: '20px (1.25rem)',
		lineHeight: '115%',
		charSpacing: '0%',
		styles: [
			{
				fontFamily: 'var(--ds-font-body)',
				fontSize: '1.25rem',
				fontWeight: 700,
				lineHeight: 1.15,
			},
		],
	},
	{
		names: ['Heading 6'],
		fontWeights: [700],
		typeface: 'Inter',
		fontWeightDisplay: 'Bold-700',
		fontSize: '18px (1.125rem)',
		lineHeight: '120%',
		charSpacing: '0%',
		styles: [
			{
				fontFamily: 'var(--ds-font-body)',
				fontSize: '1.125rem',
				fontWeight: 700,
				lineHeight: 1.2,
			},
		],
	},
	{
		names: ['Subtitle 1'],
		fontWeights: [400],
		typeface: 'Inter',
		fontWeightDisplay: 'Regular-400',
		fontSize: '16px (1rem)',
		lineHeight: '140%',
		charSpacing: '0%',
		styles: [
			{
				fontFamily: 'var(--ds-font-body)',
				fontSize: '1rem',
				fontWeight: 400,
				lineHeight: 1.4,
			},
		],
	},
	{
		names: ['Subtitle 2'],
		fontWeights: [600],
		typeface: 'Inter',
		fontWeightDisplay: 'SemiBold-600',
		fontSize: '14px (0.875rem)',
		lineHeight: '140%',
		charSpacing: '0%',
		styles: [
			{
				fontFamily: 'var(--ds-font-body)',
				fontSize: '0.875rem',
				fontWeight: 600,
				lineHeight: 1.4,
			},
		],
	},
	{
		names: ['Body 1 / Regular', 'Body 1 / Semi Bold', 'Body 1 / Bold'],
		fontWeights: [400, 600, 700],
		typeface: 'Inter',
		fontWeightDisplay: 'Regular-400\nSemiBold-600\nBold-700',
		fontSize: '16px (1rem)',
		lineHeight: '150%',
		charSpacing: '0%',
		styles: [
			{
				fontFamily: 'var(--ds-font-body)',
				fontSize: '1rem',
				fontWeight: 400,
				lineHeight: 1.5,
			},
			{
				fontFamily: 'var(--ds-font-body)',
				fontSize: '1rem',
				fontWeight: 600,
				lineHeight: 1.5,
			},
			{
				fontFamily: 'var(--ds-font-body)',
				fontSize: '1rem',
				fontWeight: 700,
				lineHeight: 1.5,
			},
		],
	},
	{
		names: ['Button 1'],
		fontWeights: [600],
		typeface: 'Inter',
		fontWeightDisplay: 'SemiBold-600',
		fontSize: '16px (1rem)',
		lineHeight: '100%',
		charSpacing: '0%',
		styles: [
			{
				fontFamily: 'var(--ds-font-body)',
				fontSize: '1rem',
				fontWeight: 600,
				lineHeight: 1.0,
			},
		],
	},
	{
		names: ['Button 2'],
		fontWeights: [600],
		typeface: 'Inter',
		fontWeightDisplay: 'SemiBold-600',
		fontSize: '14px (0.875rem)',
		lineHeight: '100%',
		charSpacing: '0%',
		styles: [
			{
				fontFamily: 'var(--ds-font-body)',
				fontSize: '0.875rem',
				fontWeight: 600,
				lineHeight: 1.0,
			},
		],
	},
	{
		names: ['Button 3'],
		fontWeights: [600],
		typeface: 'Inter',
		fontWeightDisplay: 'SemiBold-600',
		fontSize: '12px (0.75rem)',
		lineHeight: '100%',
		charSpacing: '0%',
		styles: [
			{
				fontFamily: 'var(--ds-font-body)',
				fontSize: '0.75rem',
				fontWeight: 600,
				lineHeight: 1.0,
			},
		],
	},
	{
		names: ['Caption'],
		fontWeights: [400],
		typeface: 'Inter',
		fontWeightDisplay: 'Regular-400',
		fontSize: '12px (0.75rem)',
		lineHeight: '120%',
		charSpacing: '0%',
		styles: [
			{
				fontFamily: 'var(--ds-font-body)',
				fontSize: '0.75rem',
				fontWeight: 400,
				lineHeight: 1.2,
			},
		],
	},
	{
		names: ['OVERLINE'],
		fontWeights: [700],
		typeface: 'Inter',
		fontWeightDisplay: 'Bold-700',
		fontSize: '10px (0.625rem)',
		lineHeight: '120%',
		charSpacing: '1px',
		styles: [
			{
				fontFamily: 'var(--ds-font-body)',
				fontSize: '0.625rem',
				fontWeight: 700,
				lineHeight: 1.2,
				letterSpacing: '1px',
				textTransform: 'uppercase' as const,
			},
		],
	},
	{
		names: ['Code - Large', 'Code - Medium'],
		fontWeights: [400, 400],
		typeface: 'JetBrains Mono',
		fontWeightDisplay: 'Regular-400',
		fontSize: '16px (1rem)\n14px (0.875rem)',
		lineHeight: '110%',
		charSpacing: '0%',
		styles: [
			{
				fontFamily: 'var(--ds-font-code)',
				fontSize: '1rem',
				fontWeight: 400,
				lineHeight: 1.1,
			},
			{
				fontFamily: 'var(--ds-font-code)',
				fontSize: '0.875rem',
				fontWeight: 400,
				lineHeight: 1.1,
			},
		],
	},
];

const cellStyle: CSSProperties = {
	fontFamily: 'var(--ds-font-body)',
	fontWeight: 400,
	fontSize: 14,
	lineHeight: '24px',
	color: 'var(--ds-neutral-900)',
	borderBottom: '1px solid var(--ds-neutral-200)',
	padding: '24px 8px',
	verticalAlign: 'top',
};

const headerStyle: CSSProperties = {
	fontFamily: 'var(--ds-font-body)',
	fontWeight: 700,
	fontSize: 16,
	lineHeight: '20px',
	color: 'var(--ds-neutral-800)',
	borderBottom: '1px solid var(--ds-neutral-200)',
	padding: '16px 8px',
	textAlign: 'left',
};

const TypographyDisplay = () => (
	<div style={{ padding: 24, width: '100%' }}>
		<div style={{ marginBottom: 32 }}>
			<h2
				style={{
					fontFamily: 'var(--ds-font-heading)',
					fontWeight: 600,
					fontSize: 28,
					lineHeight: 1.2,
					color: 'var(--ds-neutral-900)',
					marginTop: 0,
					marginBottom: 8,
				}}
			>
				Type Scale
			</h2>
			<p
				style={{
					fontFamily: 'var(--ds-font-body)',
					fontWeight: 400,
					fontSize: 18,
					lineHeight: '28px',
					color: 'var(--ds-neutral-700)',
					marginTop: 0,
				}}
			>
				The typography system follows the{' '}
				<a
					href="https://m2.material.io/design/typography/the-type-system.html#type-scale"
					target="_blank"
					rel="noopener noreferrer"
					style={{
						color: 'var(--ds-neutral-1000)',
						textDecoration: 'underline',
					}}
				>
					Material Design typographic scale
				</a>{' '}
				that provides a limited set of type sizes that work well together for a
				consistent layout.
			</p>
		</div>

		<table
			style={{
				width: '100%',
				borderCollapse: 'collapse',
				minWidth: 650,
			}}
		>
			<thead>
				<tr>
					<th style={{ ...headerStyle, minWidth: 200 }}>Style</th>
					<th style={headerStyle}>Typeface</th>
					<th style={headerStyle}>Font Weights</th>
					<th style={headerStyle}>Font Size</th>
					<th style={headerStyle}>Line Height</th>
					<th style={headerStyle}>Char. Spacing</th>
				</tr>
			</thead>
			<tbody>
				{typographyData.map((row) => (
					<tr key={row.names[0]}>
						<td style={{ ...cellStyle, minWidth: 200 }}>
							<div
								style={{
									display: 'flex',
									gap: 8,
									flexDirection: 'column',
								}}
							>
								{row.names.map((name, i) => (
									<span key={name} style={row.styles[i]}>
										{name}
									</span>
								))}
							</div>
						</td>
						<td style={cellStyle}>{row.typeface}</td>
						<td style={cellStyle}>
							<span style={{ whiteSpace: 'pre-line' }}>
								{row.fontWeightDisplay}
							</span>
						</td>
						<td style={cellStyle}>
							<span style={{ whiteSpace: 'pre-line' }}>{row.fontSize}</span>
						</td>
						<td style={cellStyle}>{row.lineHeight}</td>
						<td style={cellStyle}>{row.charSpacing}</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

export const Typography: Story = {
	render: () => <TypographyDisplay />,
};
