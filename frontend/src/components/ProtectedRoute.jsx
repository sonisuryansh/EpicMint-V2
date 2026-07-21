import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * ProtectedRoute component.
 * Safely guards private pages (/profile, /create, /create-blog).
 * If user is authenticated -> renders children.
 * If user is unauthenticated -> redirects safely to /signin.
 * If session is restoring from token -> renders a clean loading state.
 */
export function ProtectedRoute({ children }) {
    const { isAuthenticated, token, user } = useAuth()
    const location = useLocation()

    // Token exists in storage but user profile is restoring from API
    if (token && !user) {
        return (
            <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
                <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 1rem' }} />
                <p className="text-muted">Verifying session...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace state={{ from: location }} />
    }

    return children
}

export default ProtectedRoute
