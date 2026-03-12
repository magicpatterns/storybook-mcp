import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
	title: 'Example/Toggle',
	component: Toggle,
	tags: ['autodocs'],
	args: {
		onChange: fn(),
	},
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Off: Story = {
	args: {
		label: 'Notifications',
		checked: false,
	},
};

export const On: Story = {
	args: {
		label: 'Dark mode',
		checked: true,
	},
};

export const Disabled: Story = {
	args: {
		label: 'Locked setting',
		checked: true,
		disabled: true,
	},
};

export const Small: Story = {
	args: {
		label: 'Compact',
		size: 'small',
	},
};
