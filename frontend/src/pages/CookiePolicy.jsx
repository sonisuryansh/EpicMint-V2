import React, { useEffect } from 'react'

function CookiePolicy() {
    useEffect(() => {
        document.title = 'Cookie Policy — EpicMint'
    }, [])

    return (
        <div style={{ padding: '3rem 0 5rem' }}>
            <div className="container" style={{ maxWidth: 840 }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <div className="section-tag mb-2">🍪 Data Storage</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }} className="gradient-text">
                        Cookie Policy
                    </h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                        Last Updated: July 20, 2026
                    </p>
                </div>

                <div className="card" style={{ padding: '2.5rem', background: 'var(--bg-card)', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, marginTop: 0 }}>1. What Are Cookies?</h2>
                    <p>
                        Cookies and browser local storage are small text files placed on your device to ensure smooth user navigation, retain Web3 wallet session states, and save theme preferences.
                    </p>

                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, marginTop: '2rem' }}>2. Types of Storage We Use</h2>
                    <ul style={{ paddingLeft: '1.25rem' }}>
                        <li><strong>Essential Web3 Wallet Sessions</strong>: Stores active MetaMask wallet connection states in <code>localStorage</code> (e.g. <code>epicmint_wallet_connected</code>).</li>
                        <li><strong>Authentication JWT Tokens</strong>: Session cookies to maintain secure authenticated API requests for profile updates.</li>
                        <li><strong>User Preferences</strong>: Saves your chosen dark/light theme setting.</li>
                    </ul>

                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, marginTop: '2rem' }}>3. How to Disable Cookies</h2>
                    <p>
                        You can configure your web browser settings to reject cookies or clear local storage at any time. Note that disabling local storage may require you to reconnect your MetaMask wallet on every page refresh.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CookiePolicy
