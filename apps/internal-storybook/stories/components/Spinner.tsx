import React from 'react';
import './spinner.css';

interface SpinnerProps {
	/**
	 * Size of the spinner
	 */
	size?: 'small' | 'medium' | 'large';
	/**
	 * Accessible label describing what is loading
	 */
	label?: string;
}

/**
 * Animated loading spinner
 *
 * @import import { Spinner } from '@my-org/my-component-library';
 * @summary Circular loading indicator with configurable size.
 */
export const Spinner = ({ size = 'medium', label = 'Loading' }: SpinnerProps) => {
	return (
		<span
			className={['storybook-spinner', `storybook-spinner--${size}`].join(' ')}
			role="status"
			aria-label={label}
		>
			<span className="storybook-spinner__circle" />
		</span>
	);
};
