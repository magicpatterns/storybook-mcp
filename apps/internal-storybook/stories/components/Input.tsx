import React from 'react';
import './input.css';

interface InputProps {
	/**
	 * Input label text
	 */
	label: string;
	/**
	 * Placeholder text
	 */
	placeholder?: string;
	/**
	 * Current value
	 */
	value?: string;
	/**
	 * Whether the input is disabled
	 */
	disabled?: boolean;
	/**
	 * Error message to display
	 */
	error?: string;
	/**
	 * Input type
	 */
	type?: 'text' | 'email' | 'password' | 'number';
	/**
	 * Change handler
	 */
	onChange?: (value: string) => void;
}

/**
 * Text input field with label and validation support
 *
 * @import import { Input } from '@my-org/my-component-library';
 * @summary Form text input with label, placeholder, and error state.
 */
export const Input = ({
	label,
	placeholder,
	value,
	disabled = false,
	error,
	type = 'text',
	onChange,
}: InputProps) => {
	return (
		<div className={['storybook-input', error ? 'storybook-input--error' : ''].join(' ')}>
			<label className="storybook-input__label">{label}</label>
			<input
				type={type}
				className="storybook-input__field"
				placeholder={placeholder}
				value={value}
				disabled={disabled}
				onChange={(e) => onChange?.(e.target.value)}
			/>
			{error && <span className="storybook-input__error">{error}</span>}
		</div>
	);
};
