import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
	title: 'Example/Input',
	component: Input,
	tags: ['autodocs'],
	args: {
		onChange: fn(),
	},
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
	args: {
		label: 'Email',
		placeholder: 'you@example.com',
	},
};

export const WithValue: Story = {
	args: {
		label: 'Name',
		value: 'Jane Doe',
	},
};

export const WithError: Story = {
	args: {
		label: 'Email',
		value: 'not-an-email',
		error: 'Please enter a valid email address',
	},
};

export const Disabled: Story = {
	args: {
		label: 'Username',
		value: 'janedoe',
		disabled: true,
	},
};

export const Password: Story = {
	args: {
		label: 'Password',
		placeholder: 'Enter your password',
		type: 'password',
	},
};
