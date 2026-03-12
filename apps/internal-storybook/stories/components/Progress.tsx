import React from 'react';
import './progress.css';

interface ProgressProps {
	/**
	 * Progress value between 0 and 100
	 */
	value: number;
	/**
	 * Optional label displayed above the bar
	 */
	label?: string;
	/**
	 * Whether to show the percentage text
	 */
	showValue?: boolean;
	/**
	 * Size of the progress bar
	 */
	size?: 'small' | 'medium' | 'large';
	/**
	 * Color variant
	 */
	variant?: 'default' | 'success' | 'warning' | 'error';
}

/**
 * Horizontal progress bar for completion tracking
 *
 * @import import { Progress } from '@my-org/my-component-library';
 * @summary Progress bar showing completion percentage with optional label.
 */
export const Progress = ({
	value,
	label,
	showValue = false,
	size = 'medium',
	variant = 'default',
}: ProgressProps) => {
	const clamped = Math.max(0, Math.min(100, value));
	return (
		<div className="storybook-progress">
			{(label || showValue) && (
				<div className="storybook-progress__header">
					{label && <span className="storybook-progress__label">{label}</span>}
					{showValue && <span className="storybook-progress__value">{clamped}%</span>}
				</div>
			)}
			<div
				className={[
					'storybook-progress__track',
					`storybook-progress__track--${size}`,
				].join(' ')}
				role="progressbar"
				aria-valuenow={clamped}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label={label}
			>
				<div
					className={[
						'storybook-progress__fill',
						`storybook-progress__fill--${variant}`,
					].join(' ')}
					style={{ width: `${clamped}%` }}
				/>
			</div>
		</div>
	);
};
