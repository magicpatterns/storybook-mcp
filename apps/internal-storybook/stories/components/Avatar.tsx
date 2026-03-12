import React from 'react';
import './avatar.css';

interface AvatarProps {
	/**
	 * The image source URL
	 */
	src?: string;
	/**
	 * Alt text for the avatar image
	 */
	alt?: string;
	/**
	 * User's full name, used for initials fallback
	 */
	name: string;
	/**
	 * Size of the avatar
	 */
	size?: 'small' | 'medium' | 'large';
	/**
	 * Visual style variant
	 */
	variant?: 'circle' | 'rounded';
}

function getInitials(name: string): string {
	return name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

/**
 * Displays a user avatar with image or initials fallback
 *
 * @import import { Avatar } from '@my-org/my-component-library';
 * @summary User avatar that shows a profile image or falls back to initials.
 */
export const Avatar = ({ src, alt, name, size = 'medium', variant = 'circle' }: AvatarProps) => {
	const initials = getInitials(name);
	return (
		<div
			className={[
				'storybook-avatar',
				`storybook-avatar--${size}`,
				`storybook-avatar--${variant}`,
			].join(' ')}
			role="img"
			aria-label={alt || name}
		>
			{src ? (
				<img src={src} alt={alt || name} className="storybook-avatar__image" />
			) : (
				<span className="storybook-avatar__initials">{initials}</span>
			)}
		</div>
	);
};
