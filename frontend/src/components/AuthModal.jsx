import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWeb3 } from '../contexts/Web3Context'

function AuthModal({ isOpen, onClose }) {
    const { login, register, loginWithGoogle, authError } = useAuth()
    const { connect, isConnecting } = useWeb3()

    const [isSignUp, setIsSignUp] = useState(false)
    const [form, setForm] = useState({ username: '', email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const googleBtnRef = useRef(null)

    // Handle Google OAuth initialization when modal is open and script is loaded
    useEffect(() => {
        if (!isOpen) return

        let timer
        const initGoogle = () => {
            if (window.google?.accounts?.id) {
                const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id'
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleCredentialResponse,
                })

                if (googleBtnRef.current) {
                    window.google.accounts.id.renderButton(googleBtnRef.current, {
                        theme: 'outline',
                        size: 'large',
                        width: '100%',
                    })
                }
            } else {
                // Retry if script is still loading
                timer = setTimeout(initGoogle, 300)
            }
        }

        initGoogle()
        return () => clearTimeout(timer)
    }, [isOpen, isSignUp])

    const handleGoogleCredentialResponse = async (response) => {
        setLoading(true)
        setError('')
        try {
            await loginWithGoogle(response.credential)
            onClose()
        } catch (err) {
            setError(err.message || 'Google Auth failed')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            if (isSignUp) {
                if (!form.username) throw new Error('Username is required')
                await register(form.username, form.email, form.password)
            } else {
                await login(form.email, form.password)
            }
            onClose()
        } catch (err) {
            setError(err.message || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    const handleWalletConnect = async () => {
        setError('')
        try {
            await connect()
            onClose()
        } catch (err) {
            setError(err.message || 'Wallet connection failed')
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.25rem',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                    }}
                    aria-label="Close modal"
                >
                    ✕
                </button>

                <h2 id="modal-title" className="text-center mb-6" style={{ fontWeight: 800 }}>
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>

                {/* Tab buttons */}
                <div style={{
                    display: 'flex',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.25rem',
                    marginBottom: '1.5rem',
                }}>
                    <button
                        className="btn"
                        style={{
                            flex: 1,
                            background: !isSignUp ? 'var(--bg-card)' : 'transparent',
                            color: !isSignUp ? 'var(--text-primary)' : 'var(--text-muted)',
                            borderRadius: 'calc(var(--radius-md) - 2px)',
                        }}
                        onClick={() => setIsSignUp(false)}
                    >
                        Sign In
                    </button>
                    <button
                        className="btn"
                        style={{
                            flex: 1,
                            background: isSignUp ? 'var(--bg-card)' : 'transparent',
                            color: isSignUp ? 'var(--text-primary)' : 'var(--text-muted)',
                            borderRadius: 'calc(var(--radius-md) - 2px)',
                        }}
                        onClick={() => setIsSignUp(true)}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Error Banner */}
                {(error || authError) && (
                    <div className="alert alert-error mb-4">
                        ⚠️ {error || authError}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {isSignUp && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="username">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                className="form-control"
                                placeholder="creative_mind"
                                value={form.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-control"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full btn-lg mb-4"
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : (isSignUp ? 'Create Account' : 'Sign In')}
                    </button>
                </form>

                <div className="divider text-center text-xs text-muted mb-4" style={{ position: 'relative' }}>
                    <span style={{ background: 'var(--bg-card)', padding: '0 0.5rem', position: 'relative', zIndex: 1 }}>OR CONTINUE WITH</span>
                </div>

                {/* OAuth Providers */}
                <div className="flex flex-col gap-3">
                    {/* Google OAuth Button Container */}
                    <div ref={googleBtnRef} style={{ width: '100%', minHeight: 40 }} />
                </div>
            </div>
        </div>
    )
}

export default AuthModal
