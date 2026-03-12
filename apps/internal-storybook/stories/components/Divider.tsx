import React from 'react';
import './divider.css';

interface DividerProps {
	/**
	 * Optional text label displayed in the center of the divider
	 */
	label?: string;
	/**
	 * Spacing above and below the divider
	 */
	spacing?: 'small' | 'medium' | 'large';
	/**
	 * Orientation of the divider
	 */
	orientation?: 'horizontal' | 'vertical';
}

/**
 * Visual separator between content sections
 *
 * @import import { Divider } from '@my-org/my-component-library';
 * @summary Horizontal or vertical line separator with optional label.
 */
export const Divider = ({
	label,
	spacing = 'medium',
	orientation = 'horizontal',
}: DividerProps) => {
	if (orientation === 'vertical') {
		return (
			<div
				className={[
					'storybook-divider',
					'storybook-divider--vertical',
					`storybook-divider--${spacing}`,
				].join(' ')}
				role="separator"
				aria-orientation="vertical"
			/>
		);
	}

	return (
		<div
			className={['storybook-divider', `storybook-divider--${spacing}`].join(' ')}
			role="separator"
		>
			{label ? (
				<>
					<span className="storybook-divider__line" />
					<span className="storybook-divider__label">{label}</span>
					<span className="storybook-divider__line" />
				</>
			) : (
				<span className="storybook-divider__line storybook-divider__line--full" />
			)}
		</div>
	);
};
