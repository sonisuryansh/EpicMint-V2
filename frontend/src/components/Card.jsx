import React from 'react'

function Card({ title, children, className = '', ...props }) {
    return (
        <div className={`card border-0 ${className}`} {...props}>
            {title && <div className="card-header bg-white border-0 py-3"><h5 className="mb-0 fw-bold">{title}</h5></div>}
            <div className="card-body">{children}</div>
        </div>
    )
}

export default Card
