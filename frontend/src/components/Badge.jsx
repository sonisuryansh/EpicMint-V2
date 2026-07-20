import React from 'react'

function Badge({ variant = 'primary', children, className = '', ...props }) {
    const variantClass = `badge bg-${variant}`
    return (
        <span className={`${variantClass} ${className}`} {...props}>
            {children}
        </span>
    )
}

export default Badge
