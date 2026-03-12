import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
	title: 'Example/Tooltip',
	component: Tooltip,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<div style={{ padding: '80px', display: 'flex', justifyContent: 'center' }}>
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Top: Story = {
	args: {
		content: 'This is a tooltip',
		position: 'top',
		children: <button type="button">Hover me</button>,
	},
};

export const Bottom: Story = {
	args: {
		content: 'Tooltip below',
		position: 'bottom',
		children: <button type="button">Hover me</button>,
	},
};

export const Left: Story = {
	args: {
		content: 'Left side',
		position: 'left',
		children: <button type="button">Hover me</button>,
	},
};

export const Right: Story = {
	args: {
		content: 'Right side',
		position: 'right',
		children: <button type="button">Hover me</button>,
	},
};
