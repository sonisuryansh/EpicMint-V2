import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const DOCS_SECTIONS = [
    { id: 'introduction', title: '1. Introduction', icon: '🚀' },
    { id: 'platform-overview', title: '2. Platform Overview', icon: '⚡' },
    { id: 'how-to-create', title: '3. How to Create an NFT', icon: '🎨' },
    { id: 'wallet-connection', title: '4. Wallet Connection', icon: '🔗' },
    { id: 'metadata-ipfs', title: '5. Metadata & IPFS Storage', icon: '📦' },
    { id: 'royalties', title: '6. Creator Royalties', icon: '💎' },
    { id: 'smart-contract', title: '7. Smart Contract Architecture', icon: '📜' },
    { id: 'marketplace-flow', title: '8. Marketplace Flow (Buy & Sell)', icon: '🛒' },
    { id: 'creator-verification', title: '9. Creator Verification', icon: '🛡️' },
    { id: 'faqs', title: '10. Technical FAQs', icon: '❓' },
]

function Documentation() {
    const [activeSection, setActiveSection] = useState('introduction')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        document.title = 'Documentation — EpicMint NFT Marketplace'
    }, [])

    const filteredSections = DOCS_SECTIONS.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div style={{ padding: '3rem 0 5rem' }}>
            <div className="container">
                {/* Header */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--brand-purple-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link> / Docs
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }} className="gradient-text">
                        EpicMint Documentation
                    </h1>
                    <p className="text-secondary" style={{ fontSize: '1.1rem' }}>
                        Everything you need to know about minting, trading, smart contracts, and Pinata IPFS metadata.
                    </p>
                </div>

                <div className="docs-grid">
                    {/* Left Sidebar Navigation */}
                    <div className="card docs-sidebar" style={{ padding: '1.25rem', background: 'var(--bg-card)' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="🔍 Search docs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ fontSize: '0.85rem', marginBottom: 0 }}
                            />
                        </div>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {filteredSections.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => {
                                        setActiveSection(s.id)
                                        document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        padding: '0.6rem 0.85rem',
                                        borderRadius: 'var(--radius-sm)',
                                        border: 'none',
                                        background: activeSection === s.id ? 'var(--brand-purple)' : 'transparent',
                                        color: activeSection === s.id ? '#fff' : 'var(--text-muted)',
                                        fontWeight: activeSection === s.id ? 700 : 500,
                                        fontSize: '0.85rem',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <span>{s.icon}</span>
                                    <span>{s.title}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Documentation Body */}
                    <div className="docs-content" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                        {/* 1. Introduction */}
                        <section id="introduction" className="card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>🚀 1. Introduction</h2>
                            <p className="text-secondary" style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
                                Welcome to <strong>EpicMint</strong>, a next-generation decentralized NFT marketplace built for digital creators, collectors, and Web3 enthusiasts. EpicMint enables creators to mint high-resolution digital collectibles, leverage AI-powered prompt metadata generation, store assets immutably on IPFS via Pinata, and execute on-chain trading on the Ethereum Sepolia Testnet.
                            </p>
                            <div className="alert alert-info" style={{ wordBreak: 'break-all' }}>
                                💡 <strong>Live Contract Address (Sepolia Testnet):</strong> <code style={{ color: 'var(--brand-purple-light)', wordBreak: 'break-all' }}>0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8</code>
                            </div>
                        </section>

                        {/* 2. Platform Overview */}
                        <section id="platform-overview" className="card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>⚡ 2. Platform Overview</h2>
                            <p className="text-secondary" style={{ lineHeight: 1.8, marginBottom: '1.25rem' }}>
                                EpicMint operates on a modern hybrid architecture combining high-speed Node.js / MongoDB backend services with decentralized Ethereum smart contracts and Pinata IPFS file storage.
                            </p>
                            <div className="grid grid-3" style={{ gap: '1rem' }}>
                                <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                                    <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>🎨 Creator Suite</h4>
                                    <p className="text-xs text-muted">Integrated Google Gemini AI for instant metadata populating, image auto-compression, and automated IPFS pinning.</p>
                                </div>
                                <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                                    <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>🛒 Marketplace</h4>
                                    <p className="text-xs text-muted">Direct wallet-to-wallet atomic ETH purchases with automated database trade history transaction logging.</p>
                                </div>
                                <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                                    <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>🔒 Storage Security</h4>
                                    <p className="text-xs text-muted">Dual-region Pinata IPFS nodes ensuring 100% permanent media accessibility with zero dead link risk.</p>
                                </div>
                            </div>
                        </section>

                        {/* 3. How to Create an NFT */}
                        <section id="how-to-create" className="card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>🎨 3. How to Create an NFT</h2>
                            <ol style={{ paddingLeft: '1.25rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                                <li>Navigate to the <Link to="/create" style={{ color: 'var(--brand-purple-light)' }}>Create NFT</Link> page.</li>
                                <li>Connect your <strong>MetaMask Wallet</strong> to Sepolia Testnet.</li>
                                <li>Upload your digital media asset (PNG, JPG, WEBP, GIF up to 10MB).</li>
                                <li>Use <strong>Gemini AI Enhancer</strong> by describing your asset concept, or enter Title &amp; Description manually.</li>
                                <li>Set your listing price in <strong>ETH</strong> and specify creator royalty percentage (0% to 10%).</li>
                                <li>Click <strong>✨ Mint &amp; List NFT</strong> to execute IPFS pinning and smart contract minting!</li>
                            </ol>
                        </section>

                        {/* 4. Wallet Connection */}
                        <section id="wallet-connection" className="card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>🔗 4. Wallet Connection</h2>
                            <p className="text-secondary" style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
                                EpicMint seamlessly integrates with <strong>MetaMask</strong> and any injected EIP-1193 Web3 provider.
                            </p>
                            <pre style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-sm)', overflowX: 'auto', fontSize: '0.85rem' }}>
<code>{`// Network Parameters for Sepolia Testnet
Chain ID: 11155111 (0xaa36a7)
Currency Symbol: SepoliaETH
RPC URL: https://sepolia.infura.io/v3/
Block Explorer: https://sepolia.etherscan.io`}</code>
                            </pre>
                        </section>

                        {/* 5. Metadata & IPFS Storage */}
                        <section id="metadata-ipfs" className="card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>📦 5. Metadata &amp; IPFS Storage (Pinata)</h2>
                            <p className="text-secondary" style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
                                All assets on EpicMint follow the standard ERC-721 metadata schema stored permanently on IPFS.
                            </p>
                            <pre style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-sm)', overflowX: 'auto', fontSize: '0.85rem' }}>
<code>{`{
  "name": "Suryansh: Fragment of the Eternal Sun",
  "description": "Forged in the stellar nurseries of the deep cosmos...",
  "image": "ipfs://QmXRXN2VfACm...",
  "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmXRXN2VfACm...",
  "attributes": [
    { "trait_type": "Style", "value": "Celestial Realism" },
    { "trait_type": "Rarity", "value": "Mythic" }
  ]
}`}</code>
                            </pre>
                        </section>

                        {/* 6. Creator Royalties */}
                        <section id="royalties" className="card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>💎 6. Creator Royalties</h2>
                            <p className="text-secondary" style={{ lineHeight: 1.8 }}>
                                Creators earn perpetual royalties on secondary marketplace sales. When an NFT is resold, the contract calculates the royalty percentage set during minting and transfers funds directly to the creator's wallet address.
                            </p>
                        </section>

                        {/* 7. Smart Contract Architecture */}
                        <section id="smart-contract" className="card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>📜 7. Smart Contract Architecture</h2>
                            <p className="text-secondary" style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
                                Built using <strong>OpenZeppelin v5</strong> and compiled with Solidity 0.8.24 (\`cancun\` EVM target).
                            </p>
                            <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                                <li><code style={{ color: 'var(--brand-purple-light)' }}>EpicMintNFT.sol</code>: ERC-721 token contract with custom URI storage and verified creator checks.</li>
                                <li><code style={{ color: 'var(--brand-purple-light)' }}>EpicMintMarketplace.sol</code>: Non-custodial marketplace contract facilitating fixed-price listings and atomic transfers.</li>
                            </ul>
                        </section>

                        {/* 8. Marketplace Flow */}
                        <section id="marketplace-flow" className="card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>🛒 8. Marketplace Flow (Buying &amp; Selling)</h2>
                            <p className="text-secondary" style={{ lineHeight: 1.8 }}>
                                Buyers select an NFT, click <strong>🛒 Buy NFT</strong>, and sign the ETH payment in MetaMask. Upon on-chain confirmation, ownership updates immediately in MongoDB and a permanent record is logged in the <strong>Transaction History</strong>.
                            </p>
                        </section>

                        {/* 9. Creator Verification */}
                        <section id="creator-verification" className="card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>🛡️ 9. Creator Verification</h2>
                            <p className="text-secondary" style={{ lineHeight: 1.8 }}>
                                EpicMint automatically verifies smart contract deployers and active creators to protect collectors from fraud and counterfeit collections. Verified creators receive a green verification badge on their profile and NFT listings.
                            </p>
                        </section>

                        {/* 10. Technical FAQs */}
                        <section id="faqs" className="card" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>❓ 10. Technical FAQs</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <h4 style={{ fontWeight: 700 }}>Q: What network does EpicMint use?</h4>
                                    <p className="text-sm text-secondary">A: EpicMint is deployed on Ethereum Sepolia Testnet for zero-cost testing and validation.</p>
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 700 }}>Q: How do I get Sepolia Testnet ETH?</h4>
                                    <p className="text-sm text-secondary">A: You can request free Sepolia ETH from the official Google Cloud Sepolia Faucet or Alchemy Sepolia Faucet.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Documentation
