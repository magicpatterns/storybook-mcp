import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
	title: 'Example/Progress',
	component: Progress,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
	args: {
		value: 60,
		label: 'Upload progress',
		showValue: true,
	},
};

export const Complete: Story = {
	args: {
		value: 100,
		label: 'Complete',
		showValue: true,
		variant: 'success',
	},
};

export const Warning: Story = {
	args: {
		value: 80,
		label: 'Storage used',
		showValue: true,
		variant: 'warning',
	},
};

export const Error: Story = {
	args: {
		value: 95,
		label: 'Disk space',
		showValue: true,
		variant: 'error',
	},
};

export const Small: Story = {
	args: {
		value: 40,
		size: 'small',
	},
};

export const Large: Story = {
	args: {
		value: 70,
		label: 'Progress',
		showValue: true,
		size: 'large',
	},
};
