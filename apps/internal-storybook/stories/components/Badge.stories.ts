import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
	title: 'Example/Badge',
	component: Badge,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
	args: { label: 'Default' },
};

export const Success: Story = {
	args: { label: 'Active', variant: 'success' },
};

export const Warning: Story = {
	args: { label: 'Pending', variant: 'warning' },
};

export const Error: Story = {
	args: { label: 'Failed', variant: 'error' },
};

export const Info: Story = {
	args: { label: '3 new', variant: 'info' },
};

export const Small: Story = {
	args: { label: '99+', variant: 'error', size: 'small' },
};
