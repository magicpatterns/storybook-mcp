import React, { useState } from 'react';
import './tooltip.css';

interface TooltipProps {
	/**
	 * Tooltip text content
	 */
	content: string;
	/**
	 * The element that triggers the tooltip
	 */
	children: React.ReactNode;
	/**
	 * Placement of the tooltip relative to the trigger
	 */
	position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Contextual tooltip that appears on hover
 *
 * @import import { Tooltip } from '@my-org/my-component-library';
 * @summary Hover tooltip that displays contextual information.
 */
export const Tooltip = ({ content, children, position = 'top' }: TooltipProps) => {
	const [visible, setVisible] = useState(false);

	return (
		<span
			className="storybook-tooltip__wrapper"
			onMouseEnter={() => setVisible(true)}
			onMouseLeave={() => setVisible(false)}
		>
			{children}
			{visible && (
				<span
					className={[
						'storybook-tooltip',
						`storybook-tooltip--${position}`,
					].join(' ')}
					role="tooltip"
				>
					{content}
				</span>
			)}
		</span>
	);
};
