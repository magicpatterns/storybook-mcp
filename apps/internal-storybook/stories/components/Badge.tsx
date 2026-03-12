import React from 'react';
import './badge.css';

interface BadgeProps {
	/**
	 * Badge text content
	 */
	label: string;
	/**
	 * Visual status variant
	 */
	variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
	/**
	 * Size of the badge
	 */
	size?: 'small' | 'medium';
}

/**
 * Status indicator badge for highlighting states or counts
 *
 * @import import { Badge } from '@my-org/my-component-library';
 * @summary Inline status badge for labels, counts, or state indicators.
 */
export const Badge = ({ label, variant = 'default', size = 'medium' }: BadgeProps) => {
	return (
		<span
			className={[
				'storybook-badge',
				`storybook-badge--${variant}`,
				`storybook-badge--${size}`,
			].join(' ')}
		>
			{label}
		</span>
	);
};
