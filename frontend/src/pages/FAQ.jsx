import React, { useState, useEffect } from 'react'

const FAQ_ITEMS = [
    {
        id: '1',
        category: 'General',
        question: 'What is EpicMint?',
        answer: 'EpicMint is a next-generation decentralized NFT marketplace allowing creators to mint digital artwork, generate AI prompts & metadata, pin files permanently to IPFS via Pinata, and trade on the Ethereum Sepolia blockchain.',
    },
    {
        id: '2',
        category: 'Minting & Storage',
        question: 'How does NFT Minting work on EpicMint?',
        answer: 'When you create an NFT, your uploaded file is first pinned to IPFS via Pinata to generate a permanent content hash (CID). Then an ERC-721 smart contract execution mints your unique token on the Sepolia testnet.',
    },
    {
        id: '3',
        category: 'Royalties',
        question: 'How are creator royalties calculated?',
        answer: 'Creators can specify a royalty percentage between 0% and 10% during minting. Whenever your NFT is resold on secondary marketplace trades, the smart contract automatically deducts your royalty percentage and sends it directly to your wallet.',
    },
    {
        id: '4',
        category: 'Storage & IPFS',
        question: 'Why does EpicMint use Pinata for IPFS?',
        answer: 'Pinata provides high-speed, dual-region pinned IPFS storage (FRA1 and NYC1). This guarantees that your NFT artwork and JSON metadata remain permanently online with zero risk of HTTP 404 dead links or server crashes.',
    },
    {
        id: '5',
        category: 'Blockchain',
        question: 'How does blockchain verification work?',
        answer: 'Every NFT created on EpicMint has a verified on-chain mint transaction hash (txHash) and token ID on the Sepolia Testnet. Contract deployers and creators are verified automatically to guarantee authenticity.',
    },
    {
        id: '6',
        category: 'Troubleshooting',
        question: 'What should I do if my wallet fails to connect?',
        answer: 'Ensure you have MetaMask installed in your browser and set to Sepolia Testnet (Chain ID 11155111). Refresh the page or click "Disconnect" and reconnect your wallet.',
    },
    {
        id: '7',
        category: 'Gas Fees',
        question: 'What are gas fees and how do I get Sepolia ETH?',
        answer: 'Gas fees cover Ethereum network execution costs. Since EpicMint runs on Sepolia Testnet, you can obtain free Sepolia ETH from the official Google Cloud Sepolia Faucet or Alchemy Sepolia Faucet.',
    },
    {
        id: '8',
        category: 'Marketplace',
        question: 'What is the refund policy for NFT purchases?',
        answer: 'Because blockchain transactions are immutable and irreversible once confirmed on Sepolia Testnet, all purchases are final. Always verify token details and seller address before signing in MetaMask.',
    },
]

function FAQ() {
    const [searchQuery, setSearchQuery] = useState('')
    const [openId, setOpenId] = useState('1')

    useEffect(() => {
        document.title = 'FAQ — EpicMint NFT Marketplace'
    }, [])

    const filteredFAQs = FAQ_ITEMS.filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const toggleAccordion = (id) => {
        setOpenId(openId === id ? null : id)
    }

    return (
        <div style={{ padding: '3rem 0 5rem' }}>
            <div className="container" style={{ maxWidth: 840 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div className="section-tag mb-2">❓ Got Questions?</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }} className="gradient-text">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-secondary" style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                        Find answers to common questions about minting, Pinata IPFS, MetaMask, royalties, and Sepolia testnet.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="card" style={{ padding: '1.25rem', marginBottom: '2.5rem', background: 'var(--bg-card)' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="🔍 Search questions by keyword (e.g. royalties, Pinata, gas fees)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ marginBottom: 0 }}
                    />
                </div>

                {/* Accordion List */}
                {filteredFAQs.length === 0 ? (
                    <div className="alert alert-warning" style={{ textAlign: 'center', padding: '2rem' }}>
                        🔍 No FAQ matching your search. Please check your query or visit our <a href="/support" style={{ color: 'var(--brand-purple-light)' }}>Support page</a>.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredFAQs.map(item => (
                            <div
                                key={item.id}
                                className="card"
                                style={{
                                    padding: '1.25rem 1.5rem',
                                    background: 'var(--bg-input)',
                                    border: '1px solid var(--border-color)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onClick={() => toggleAccordion(item.id)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span className="badge badge-info text-xs">{item.category}</span>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                                            {item.question}
                                        </h3>
                                    </div>
                                    <span style={{ fontSize: '1.25rem', color: 'var(--brand-purple-light)', fontWeight: 800 }}>
                                        {openId === item.id ? '−' : '+'}
                                    </span>
                                </div>

                                {openId === item.id && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                        {item.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default FAQ
