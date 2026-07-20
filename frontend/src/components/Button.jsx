import React from 'react'

function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    type = 'button',
    onClick,
    className = '',
    ...props
}) {
    const baseClasses = 'btn'
    const variantClasses = `btn-${variant}`
    const sizeClasses = {
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg',
    }
    const widthClasses = fullWidth ? 'w-100' : ''
    const disabledClasses = disabled ? 'disabled' : ''

    const finalClasses = [
        baseClasses,
        variantClasses,
        sizeClasses[size],
        widthClasses,
        disabledClasses,
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <button
            type={type}
            className={finalClasses}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button
