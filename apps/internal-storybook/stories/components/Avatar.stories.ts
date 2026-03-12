import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
	title: 'Example/Avatar',
	component: Avatar,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
	args: {
		name: 'Jane Doe',
		src: 'https://i.pravatar.cc/150?u=jane',
		size: 'medium',
	},
};

export const WithInitials: Story = {
	args: {
		name: 'John Smith',
		size: 'medium',
	},
};

export const Small: Story = {
	args: {
		name: 'Alice',
		size: 'small',
	},
};

export const Large: Story = {
	args: {
		name: 'Bob Williams',
		src: 'https://i.pravatar.cc/150?u=bob',
		size: 'large',
	},
};

export const Rounded: Story = {
	args: {
		name: 'Carol Davis',
		variant: 'rounded',
	},
};
