import React from 'react'

function ErrorBoundary({ error, message = 'Something went wrong' }) {
    return (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <h4 className="alert-heading">Error</h4>
            <p>{message}</p>
            {error && <small className="text-muted">{error.toString()}</small>}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    )
}

export default ErrorBoundary
