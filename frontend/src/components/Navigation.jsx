import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useWeb3 } from '../contexts/Web3Context'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'

function Navigation({ theme, toggleTheme }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const { account, balance, isConnected, isConnecting, disconnect, getShortAddress } = useWeb3()
    const { user, isAuthenticated, logout } = useAuth()

    const handleSignOut = () => {
        logout()
        if (isConnected) {
            disconnect()
        }
    }

    return (
        <nav className="navbar" role="navigation" aria-label="Main navigation">
            <div className="container navbar-inner">
                {/* Logo */}
                <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <img src="/favicon.svg" alt="EpicMint" style={{ width: 34, height: 34, borderRadius: 10, filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))' }} />
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                        <span className="nav-logo-em" style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Epic</span>Mint
                    </span>
                </Link>

                {/* Desktop Links */}
                <ul className={`nav-links ${menuOpen ? 'open' : ''}`} role="list">
                    {[
                        { to: '/', label: 'Home' },
                        { to: '/marketplace', label: 'Marketplace' },
                        { to: '/create', label: 'Create' },
                        { to: '/docs', label: 'Docs' },
                        { to: '/blog', label: 'Blog' },
                    ].map(({ to, label }) => (
                        <li key={to} role="listitem">
                            <NavLink
                                to={to}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                                end={to === '/'}
                            >
                                {label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Actions */}
                <div className="nav-actions">
                    {/* Theme toggle */}
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>

                    {/* Authentication state */}
                    {isAuthenticated || isConnected ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {/* Display user details - Clicking opens My Profile */}
                            <Link to="/profile" className="wallet-btn" aria-label="User profile" title="Click to view My Profile" onClick={() => setMenuOpen(false)}>
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Profile" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <span className="wallet-dot" aria-hidden="true" />
                                )}
                                <span style={{ textTransform: 'capitalize', whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.username || getShortAddress(account)}
                                </span>
                                {isConnected && balance && (
                                    <span className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        {parseFloat(balance).toFixed(3)} ETH
                                    </span>
                                )}
                            </Link>
                        </div>
                    ) : (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setIsAuthModalOpen(true)}
                            disabled={isConnecting}
                            id="connect-wallet-btn"
                        >
                            Sign In / Connect
                        </button>
                    )}

                    {/* Hamburger */}
                    <button
                        className={`hamburger ${menuOpen ? 'open' : ''}`}
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label="Toggle mobile menu"
                        aria-expanded={menuOpen}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </div>

            {/* Render AuthModal globally linked to this navigation action */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </nav>
    )
}

export default Navigation
