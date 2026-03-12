import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Tag } from './Tag';

const meta: Meta<typeof Tag> = {
	title: 'Example/Tag',
	component: Tag,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
	args: { label: 'Design' },
};

export const Blue: Story = {
	args: { label: 'React', color: 'blue' },
};

export const Green: Story = {
	args: { label: 'Stable', color: 'green' },
};

export const Red: Story = {
	args: { label: 'Deprecated', color: 'red' },
};

export const Purple: Story = {
	args: { label: 'New', color: 'purple' },
};

export const Removable: Story = {
	args: {
		label: 'Removable tag',
		color: 'blue',
		removable: true,
		onRemove: fn(),
	},
};
