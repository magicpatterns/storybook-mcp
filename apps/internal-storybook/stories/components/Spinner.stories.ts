import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
	title: 'Example/Spinner',
	component: Spinner,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};

export const Small: Story = {
	args: { size: 'small' },
};

export const Large: Story = {
	args: { size: 'large' },
};
