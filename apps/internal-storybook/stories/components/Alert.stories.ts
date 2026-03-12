import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
	title: 'Example/Alert',
	component: Alert,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
	args: {
		title: 'Tip',
		message: 'You can customize your dashboard in the settings panel.',
		variant: 'info',
	},
};

export const Success: Story = {
	args: {
		title: 'Success',
		message: 'Your changes have been saved successfully.',
		variant: 'success',
	},
};

export const Warning: Story = {
	args: {
		title: 'Warning',
		message: 'Your trial expires in 3 days.',
		variant: 'warning',
	},
};

export const Error: Story = {
	args: {
		title: 'Error',
		message: 'Failed to save changes. Please try again.',
		variant: 'error',
	},
};

export const Dismissible: Story = {
	args: {
		message: 'This notification can be dismissed.',
		variant: 'info',
		dismissible: true,
		onDismiss: fn(),
	},
};
