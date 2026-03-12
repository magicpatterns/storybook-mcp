import React from 'react';
import './alert.css';

interface AlertProps {
	/**
	 * Alert message content
	 */
	message: string;
	/**
	 * Optional title displayed above the message
	 */
	title?: string;
	/**
	 * Visual severity variant
	 */
	variant?: 'info' | 'success' | 'warning' | 'error';
	/**
	 * Whether the alert can be dismissed
	 */
	dismissible?: boolean;
	/**
	 * Handler called when dismiss button is clicked
	 */
	onDismiss?: () => void;
}

/**
 * Notification banner for important messages
 *
 * @import import { Alert } from '@my-org/my-component-library';
 * @summary Alert banner for info, success, warning, or error messages.
 */
export const Alert = ({
	message,
	title,
	variant = 'info',
	dismissible = false,
	onDismiss,
}: AlertProps) => {
	return (
		<div className={['storybook-alert', `storybook-alert--${variant}`].join(' ')} role="alert">
			<div className="storybook-alert__content">
				{title && <strong className="storybook-alert__title">{title}</strong>}
				<p className="storybook-alert__message">{message}</p>
			</div>
			{dismissible && (
				<button
					type="button"
					className="storybook-alert__dismiss"
					onClick={onDismiss}
					aria-label="Dismiss"
				>
					×
				</button>
			)}
		</div>
	);
};
