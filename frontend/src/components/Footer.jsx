import React from 'react'
import { NavLink } from 'react-router-dom'

function Footer() {
    const year = new Date().getFullYear()

    const links = {
        Explore: [
            { label: 'Marketplace', to: '/marketplace' },
            { label: 'Create NFT', to: '/create' },
            { label: 'My Profile', to: '/profile' },
        ],
        Resources: [
            { label: 'Documentation', to: '/docs' },
            { label: 'Blog', to: '/blog' },
            { label: 'FAQ', to: '/faq' },
            { label: 'Support', to: '/support' },
        ],
        Legal: [
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Terms of Service', to: '/terms' },
            { label: 'Cookie Policy', to: '/cookies' },
        ],
    }

    const socials = [
        { label: 'Twitter / X', icon: '𝕏', href: import.meta.env.VITE_TWITTER_URL || 'https://x.com/epicmint' },
        { label: 'Discord', icon: '💬', href: import.meta.env.VITE_DISCORD_URL || 'https://discord.gg/epicmint' },
        { label: 'GitHub', icon: '⚙️', href: import.meta.env.VITE_GITHUB_URL || 'https://github.com/epicmint' },
        { label: 'Telegram', icon: '✈️', href: import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/epicmint' },
    ]

    return (
        <footer className="site-footer" role="contentinfo">
            <div className="container">
                <div className="grid grid-4" style={{ marginBottom: '3rem' }}>
                    {/* Brand */}
                    <div>
                        <div className="footer-brand">
                            <span className="gradient-text">Epic</span>Mint
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 240 }}>
                            The next-generation Web3 NFT marketplace for digital creators and collectors. Powered by OpenZeppelin v5 and Pinata IPFS.
                        </p>
                        <div className="footer-social" style={{ marginTop: '1.25rem' }}>
                            {socials.map(s => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-btn"
                                    aria-label={s.label}
                                    title={s.label}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(links).map(([section, items]) => (
                        <div key={section}>
                            <h6 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                                {section}
                            </h6>
                            <ul style={{ listStyle: 'none' }}>
                                {items.map(item => (
                                    <li key={item.label}>
                                        <NavLink to={item.to} className="footer-link">
                                            {item.label}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter CTA */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '2.5rem',
                }}>
                    <div>
                        <h6 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Stay in the loop</h6>
                        <p className="text-sm text-muted">Join our newsletter for fresh NFT drops, market updates, and creator perks.</p>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to EpicMint newsletter!') }} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your email"
                            style={{ width: 220, marginBottom: 0 }}
                            aria-label="Newsletter email"
                            required
                        />
                        <button type="submit" className="btn btn-primary btn-sm">Subscribe</button>
                    </form>
                </div>

                <div className="divider" />

                {/* Bottom bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem' }}>
                    <p className="text-sm text-muted">
                        © {year} EpicMint NFT Marketplace. All rights reserved. Built on Ethereum.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className="badge badge-success">
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                            Sepolia Testnet
                        </span>
                        <span className="text-sm text-muted">v2.0</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
