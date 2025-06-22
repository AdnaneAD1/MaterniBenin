"use client";

import Link from 'next/link';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    href,
    onClick,
    fullWidth = false,
    disabled = false,
    className = '',
    type = 'button',
    icon = null,
    iconPosition = 'left'
}) => {
    // Base classes
    let baseClasses = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none transition-colors';

    // Size classes
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base'
    };

    // Variant classes
    const variantClasses = {
        primary: 'bg-primary hover:bg-primary-dark text-white shadow-sm focus:ring-2 focus:ring-primary focus:ring-opacity-50',
        secondary: 'bg-secondary hover:bg-secondary-dark text-white shadow-sm focus:ring-2 focus:ring-secondary focus:ring-opacity-50',
        outline: 'border border-primary text-primary hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary focus:ring-opacity-50',
        ghost: 'text-primary hover:bg-gray-100',
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-2 focus:ring-red-500 focus:ring-opacity-50'
    };

    // Disabled classes
    const disabledClasses = 'opacity-50 cursor-not-allowed';

    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';

    // Combine all classes
    const buttonClasses = `
    ${baseClasses} 
    ${sizeClasses[size]} 
    ${variantClasses[variant]} 
    ${disabled ? disabledClasses : ''}
    ${widthClasses}
    ${className}
  `;

    // Render as link if href is provided
    if (href) {
        return (
            <Link href={href} className={buttonClasses}>
                {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
                {children}
                {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
            </Link>
        );
    }

    // Render as button
    return (
        <button
            type={type}
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </button>
    );
};

export default Button;
