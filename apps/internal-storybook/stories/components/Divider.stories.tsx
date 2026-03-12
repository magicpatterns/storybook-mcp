import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
	title: 'Example/Divider',
	component: Divider,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {};

export const WithLabel: Story = {
	args: {
		label: 'OR',
	},
};

export const SmallSpacing: Story = {
	args: { spacing: 'small' },
};

export const LargeSpacing: Story = {
	args: { spacing: 'large', label: 'Section' },
};

export const Vertical: Story = {
	args: { orientation: 'vertical' },
	decorators: [
		(Story) => (
			<div style={{ display: 'flex', alignItems: 'center', height: 60 }}>
				<span>Left</span>
				<Story />
				<span>Right</span>
			</div>
		),
	],
};
