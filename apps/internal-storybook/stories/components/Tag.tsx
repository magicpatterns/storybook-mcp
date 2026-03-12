import React from 'react';
import './tag.css';

interface TagProps {
	/**
	 * Tag label text
	 */
	label: string;
	/**
	 * Color variant
	 */
	color?: 'gray' | 'blue' | 'green' | 'red' | 'purple';
	/**
	 * Whether the tag can be removed
	 */
	removable?: boolean;
	/**
	 * Handler called when the remove button is clicked
	 */
	onRemove?: () => void;
}

/**
 * Compact label for categorization and filtering
 *
 * @import import { Tag } from '@my-org/my-component-library';
 * @summary Compact tag chip for categories, filters, or labels.
 */
export const Tag = ({ label, color = 'gray', removable = false, onRemove }: TagProps) => {
	return (
		<span className={['storybook-tag', `storybook-tag--${color}`].join(' ')}>
			{label}
			{removable && (
				<button
					type="button"
					className="storybook-tag__remove"
					onClick={onRemove}
					aria-label={`Remove ${label}`}
				>
					×
				</button>
			)}
		</span>
	);
};
