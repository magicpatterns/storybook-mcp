import React from 'react';
import './toggle.css';

interface ToggleProps {
	/**
	 * Whether the toggle is on
	 */
	checked?: boolean;
	/**
	 * Label text displayed next to the toggle
	 */
	label?: string;
	/**
	 * Whether the toggle is disabled
	 */
	disabled?: boolean;
	/**
	 * Size of the toggle
	 */
	size?: 'small' | 'medium';
	/**
	 * Change handler
	 */
	onChange?: (checked: boolean) => void;
}

/**
 * Toggle switch for boolean settings
 *
 * @import import { Toggle } from '@my-org/my-component-library';
 * @summary On/off toggle switch with optional label.
 */
export const Toggle = ({
	checked = false,
	label,
	disabled = false,
	size = 'medium',
	onChange,
}: ToggleProps) => {
	return (
		<label
			className={[
				'storybook-toggle',
				`storybook-toggle--${size}`,
				disabled ? 'storybook-toggle--disabled' : '',
			].join(' ')}
		>
			<button
				role="switch"
				type="button"
				aria-checked={checked}
				disabled={disabled}
				className={[
					'storybook-toggle__track',
					checked ? 'storybook-toggle__track--on' : '',
				].join(' ')}
				onClick={() => onChange?.(!checked)}
			>
				<span className="storybook-toggle__thumb" />
			</button>
			{label && <span className="storybook-toggle__label">{label}</span>}
		</label>
	);
};
