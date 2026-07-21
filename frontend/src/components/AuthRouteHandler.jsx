import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Home from '../pages/Home'
import AuthModal from './AuthModal'

/**
 * AuthRouteHandler for /signin and /signup direct URLs.
 * If user is already authenticated -> redirects to /profile.
 * If user is guest -> renders Home page with AuthModal automatically open.
 */
export function AuthRouteHandler({ mode = 'signin' }) {
    const { isAuthenticated } = useAuth()
    const [modalOpen, setModalOpen] = useState(true)

    if (isAuthenticated) {
        return <Navigate to="/profile" replace />
    }

    const isSignUp = mode === 'signup'

    return (
        <>
            <Home />
            <AuthModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                initialSignUp={isSignUp}
            />
        </>
    )
}

export default AuthRouteHandler
