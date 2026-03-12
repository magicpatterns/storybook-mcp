/**
 * @import { Meta, StoryObj } from '@storybook/react-vite'
 * @summary Color palette tokens — brand, neutral, accent, and semantic color scales.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../theme.css';

const meta: Meta = {
	title: 'Tokens/Colors',
};

export default meta;

type Story = StoryObj;

type SwatchProps = {
	color: string;
	name: string;
};

const Swatch = ({ color, name }: SwatchProps) => (
	<div
		style={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			minWidth: 100,
		}}
	>
		<div
			style={{
				width: 100,
				height: 32,
				backgroundColor: color,
				borderRadius: 4,
				border: '1px solid var(--ds-neutral-200)',
				marginBottom: 8,
			}}
		/>
		<span
			style={{
				fontFamily: 'var(--ds-font-body)',
				fontWeight: 300,
				fontSize: 11,
				lineHeight: 1.4,
				color: 'var(--ds-neutral-600)',
				textAlign: 'center',
			}}
		>
			{name}
		</span>
	</div>
);

type ColorRowProps = {
	title: string;
	colors: Array<[string, string]>;
};

const ColorRow = ({ title, colors }: ColorRowProps) => (
	<div style={{ marginBottom: 32 }}>
		<h3
			style={{
				fontFamily: 'var(--ds-font-body)',
				fontWeight: 600,
				fontSize: 18,
				lineHeight: 1.4,
				color: 'var(--ds-neutral-1000)',
				marginBottom: 8,
				marginTop: 0,
			}}
		>
			{title}
		</h3>
		<div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
			{colors.map(([key, value]) => (
				<Swatch key={key} color={value} name={key} />
			))}
		</div>
	</div>
);

const brandColors: Array<[string, string]> = [
	['050', '#F2FBFE'],
	['100', '#D9F5FF'],
	['200', '#B8E9FB'],
	['300', '#7FC9F4'],
	['400', '#3895E1'],
	['500', '#1873D2'],
	['600', '#145FAD'],
	['700', '#10498C'],
	['800', '#0D3365'],
	['900', '#091D3E'],
];

const neutralColors: Array<[string, string]> = [
	['000', '#FFFFFF'],
	['025', '#F9F9F9'],
	['050', '#EFF0F0'],
	['100', '#E6E6E6'],
	['200', '#DCDCDC'],
	['300', '#C8C9CA'],
	['400', '#B1B3B5'],
	['500', '#929497'],
	['600', '#737679'],
	['700', '#595C5F'],
	['800', '#43484C'],
	['900', '#2B2E32'],
	['1000', '#1E2124'],
];

const accentScales: Record<string, Array<[string, string]>> = {
	Citrus: [
		['050', '#FFF2DC'],
		['100', '#FDE1B1'],
		['200', '#FFBB63'],
		['300', '#FFA037'],
		['400', '#F68511'],
		['500', '#E46F00'],
		['600', '#BD5B00'],
		['700', '#9A4200'],
		['800', '#7A2F00'],
		['900', '#612300'],
	],
	Cardinal: [
		['050', '#FFEBE7'],
		['100', '#FADAD7'],
		['200', '#F6B5B0'],
		['300', '#F29189'],
		['400', '#EE6C62'],
		['500', '#EA483B'],
		['600', '#C62F23'],
		['700', '#9D0000'],
		['800', '#800000'],
		['900', '#600000'],
	],
	Rose: [
		['050', '#FFF3F7'],
		['100', '#FFEAF1'],
		['200', '#FFC3D9'],
		['300', '#FF95BD'],
		['400', '#E55491'],
		['500', '#C82269'],
		['600', '#B21659'],
		['700', '#A50952'],
		['800', '#77003A'],
		['900', '#58002B'],
	],
	Plum: [
		['050', '#F5E6F7'],
		['100', '#E8D6EC'],
		['200', '#DEC2E4'],
		['300', '#CCA3D4'],
		['400', '#B376BE'],
		['500', '#954DA4'],
		['600', '#833394'],
		['700', '#6B2E76'],
		['800', '#522A5A'],
		['900', '#462B4C'],
	],
	Seafoam: [
		['050', '#DDF7F5'],
		['100', '#C5F4F0'],
		['200', '#A8E3DF'],
		['300', '#37CBC5'],
		['400', '#27ACA7'],
		['500', '#008D85'],
		['600', '#007772'],
		['700', '#00635F'],
		['800', '#0C4F4C'],
		['900', '#123C3A'],
	],
	Leaf: [
		['050', '#EFFDF7'],
		['100', '#CEF8E0'],
		['200', '#89ECBC'],
		['300', '#49CC93'],
		['400', '#2FB880'],
		['500', '#15A46E'],
		['600', '#13865A'],
		['700', '#007249'],
		['800', '#005D36'],
		['900', '#053F27'],
	],
};

const semanticColors: Record<string, Array<[string, string]>> = {
	Info: [
		['Light', '#F2FBFE'],
		['Standard', '#1873D2'],
		['Dark', '#10498C'],
	],
	Alert: [
		['Light', '#FFEBE7'],
		['Standard', '#EA483B'],
		['Dark', '#9D0000'],
	],
	Warning: [
		['Light', '#FFF2DC'],
		['Standard', '#BD5B00'],
		['Dark', '#9A4200'],
	],
	Success: [
		['Light', '#EFFDF7'],
		['Standard', '#13865A'],
		['Dark', '#005D36'],
	],
};

const backgroundColors: Array<[string, string]> = [
	['Primary', '#FFFFFF'],
	['Secondary', '#F9F9F9'],
	['Tertiary', '#EFF0F0'],
	['Dark', '#2B2E32'],
	['Brand', '#1873D2'],
	['Brand Light', '#F2FBFE'],
	['Brand Dark', '#0D3365'],
];

const textColors: Array<[string, string]> = [
	['Primary', '#2B2E32'],
	['Secondary', '#595C5F'],
	['Placeholder', '#929497'],
	['Helper', '#595C5F'],
	['Disabled', '#C8C9CA'],
	['Brand', '#1873D2'],
	['Error', '#9D0000'],
	['Warning', '#9A4200'],
	['Success', '#007249'],
];

const ColorsDisplay = () => (
	<div style={{ padding: 32, fontFamily: 'var(--ds-font-body)' }}>
		<h2
			style={{
				fontFamily: 'var(--ds-font-heading)',
				fontWeight: 700,
				fontSize: 28,
				lineHeight: 1.15,
				color: 'var(--ds-neutral-900)',
				marginTop: 0,
				marginBottom: 24,
			}}
		>
			Color Palette
		</h2>

		<ColorRow title="Brand" colors={brandColors} />
		<ColorRow title="Neutral" colors={neutralColors} />

		<h2
			style={{
				fontFamily: 'var(--ds-font-heading)',
				fontWeight: 700,
				fontSize: 24,
				lineHeight: 1.15,
				color: 'var(--ds-neutral-900)',
				marginBottom: 16,
			}}
		>
			Accent
		</h2>
		{Object.entries(accentScales).map(([name, colors]) => (
			<ColorRow key={name} title={name} colors={colors} />
		))}

		<h2
			style={{
				fontFamily: 'var(--ds-font-heading)',
				fontWeight: 700,
				fontSize: 24,
				lineHeight: 1.15,
				color: 'var(--ds-neutral-900)',
				marginBottom: 16,
			}}
		>
			Semantic
		</h2>
		{Object.entries(semanticColors).map(([name, colors]) => (
			<ColorRow key={name} title={name} colors={colors} />
		))}

		<h2
			style={{
				fontFamily: 'var(--ds-font-heading)',
				fontWeight: 700,
				fontSize: 24,
				lineHeight: 1.15,
				color: 'var(--ds-neutral-900)',
				marginBottom: 16,
			}}
		>
			Functional
		</h2>
		<ColorRow title="Backgrounds" colors={backgroundColors} />
		<ColorRow title="Text" colors={textColors} />
	</div>
);

export const Colors: Story = {
	render: () => <ColorsDisplay />,
};
