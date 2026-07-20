import React, { useEffect } from 'react'

function PrivacyPolicy() {
    useEffect(() => {
        document.title = 'Privacy Policy — EpicMint'
    }, [])

    return (
        <div style={{ padding: '3rem 0 5rem' }}>
            <div className="container" style={{ maxWidth: 840 }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <div className="section-tag mb-2">⚖️ Legal &amp; Compliance</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }} className="gradient-text">
                        Privacy Policy
                    </h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                        Last Updated: July 20, 2026
                    </p>
                </div>

                <div className="card" style={{ padding: '2.5rem', background: 'var(--bg-card)', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, marginTop: 0 }}>1. Introduction</h2>
                    <p>
                        EpicMint ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, store, and protect information when you interact with our Web3 NFT Marketplace platform.
                    </p>

                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, marginTop: '2rem' }}>2. Data We Collect</h2>
                    <ul style={{ paddingLeft: '1.25rem' }}>
                        <li><strong>Public Wallet Addresses</strong>: When you connect Web3 wallets such as MetaMask, your public cryptographic address (e.g. <code>0x...</code>) is stored to identify your account and associate created NFTs.</li>
                        <li><strong>User Profile Data</strong>: Optional username, email address, bio, and avatar URLs stored in our secure MongoDB cluster.</li>
                        <li><strong>Support Tickets</strong>: Information submitted via our Support Form (name, email, message, screenshots).</li>
                    </ul>

                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, marginTop: '2rem' }}>3. Decentralized IPFS Storage (Pinata)</h2>
                    <p>
                        Media assets and JSON metadata pinned to IPFS via Pinata are permanently distributed on a public peer-to-peer network. Because IPFS is immutable, metadata published to IPFS cannot be deleted or modified.
                    </p>

                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, marginTop: '2rem' }}>4. Blockchain Immutability</h2>
                    <p>
                        Transactions executed on the Ethereum Sepolia Testnet (minting, buying, selling, transferring) are recorded on a public blockchain ledger. Public transaction histories are immutable and accessible to anyone.
                    </p>

                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, marginTop: '2rem' }}>5. Third-Party Services</h2>
                    <p>
                        We use Google Gemini AI APIs for prompt optimization and metadata generation, and Pinata IPFS gateway nodes for media delivery. We do not sell user personal data to third parties.
                    </p>

                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, marginTop: '2rem' }}>6. Contact Us</h2>
                    <p>
                        If you have questions regarding this Privacy Policy, please contact our privacy desk via our <a href="/support" style={{ color: 'var(--brand-purple-light)' }}>Support Form</a>.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicy
