import React, { useEffect } from 'react'

function TermsOfService() {
    useEffect(() => {
        document.title = 'Terms of Service — EpicMint'
    }, [])

    return (
        <div style={{ padding: '3rem 0 5rem' }}>
            <div className="container" style={{ maxWidth: 840 }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <div className="section-tag mb-2">📜 Terms &amp; Conditions</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }} className="gradient-text">
                        Terms of Service
                    </h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                        Last Updated: July 20, 2026
                    </p>
                </div>

                <div className="card" style={{ padding: '2.5rem', background: 'var(--bg-card)', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, marginTop: 0 }}>1. Agreement to Terms</h2>
                    <p>
                        By accessing or using EpicMint NFT Marketplace, you agree to be bound by these Terms of Service. If you do not agree, you must immediately cease using our platform.
                    </p>

                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, marginTop: '2rem' }}>2. NFT Ownership &amp; Intellectual Property</h2>
                    <p>
                        Minting an NFT on EpicMint creates a digital cryptographic token representing ownership of the associated media asset. Creators retain copyright over their original artwork unless explicitly transferred in writing.
                    </p>

                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, marginTop: '2rem' }}>3. Creator Responsibilities &amp; Prohibited Content</h2>
                    <p>
                        Creators warrant that all media uploaded to EpicMint is original work or properly licensed. Prohibited content includes:
                    </p>
                    <ul style={{ paddingLeft: '1.25rem' }}>
                        <li>Copyright or trademark infringing material</li>
                        <li>Malicious scripts, viruses, or phishing links</li>
                        <li>Explicit, harmful, or illegal media</li>
                    </ul>

                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, marginTop: '2rem' }}>4. Creator Royalties &amp; Marketplace Payments</h2>
                    <p>
                        Secondary marketplace trades enforce creator royalties up to 10%. On-chain purchases are processed using native Sepolia Testnet ETH directly through MetaMask.
                    </p>

                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, marginTop: '2rem' }}>5. Blockchain Disclaimer</h2>
                    <p>
                        Transactions confirmed on the Ethereum Sepolia Testnet are final and non-refundable. EpicMint has no control over Ethereum network gas price volatility or smart contract execution delays.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default TermsOfService
