import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { nftAPI, commentsAPI, transactionsAPI } from '../lib/api'
import { useWeb3 } from '../contexts/Web3Context'
import { useAuth } from '../contexts/AuthContext'
import { formatWeb3Error } from '../lib/web3'
import QRCode from '../components/QRCode'

function NFTDetail() {
    const { id, contractAddress, tokenId } = useParams()
    const navigate = useNavigate()
    const { account, isConnected, connect, web3Service } = useWeb3()
    const { user, isAuthenticated } = useAuth()

    const [nft, setNft] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [txLoading, setTxLoading] = useState(false)
    const [txError, setTxError] = useState('')
    const [txSuccess, setTxSuccess] = useState('')

    // Sharing & Transfer states
    const [showTransferForm, setShowTransferForm] = useState(false)
    const [recipientAddress, setRecipientAddress] = useState('')
    const [transferLoading, setTransferLoading] = useState(false)
    const [transferError, setTransferError] = useState('')
    const [transferSuccess, setTransferSuccess] = useState('')
    const [showShareMenu, setShowShareMenu] = useState(false)
    const [shareCopiedText, setShareCopiedText] = useState('')

    // Comments & Transactions states
    const [comments, setComments] = useState([])
    const [commentText, setCommentText] = useState('')
    const [commentLoading, setCommentLoading] = useState(false)
    const [commentError, setCommentError] = useState('')

    const [transactions, setTransactions] = useState([])
    const [txHistoryLoading, setTxHistoryLoading] = useState(false)

    useEffect(() => {
        fetchNFT()
    }, [id, contractAddress, tokenId])

    useEffect(() => {
        if (nft) {
            document.title = `${nft.title} — EpicMint`
            fetchComments()
            fetchTransactionHistory(nft.tokenId || nft._id)
        }
    }, [nft])

    const fetchNFT = async () => {
        setLoading(true)
        setError(null)
        try {
            const fetchParam = (contractAddress && tokenId) ? { contractAddress, tokenId } : id
            const res = await nftAPI.getById(fetchParam)
            setNft(res.data.data)
        } catch (err) {
            setError('NFT not found or backend unavailable')
        } finally {
            setLoading(false)
        }
    }

    const fetchComments = async () => {
        if (!nft?._id) return
        try {
            const res = await commentsAPI.getByNFT(nft._id)
            setComments(res.data.comments || [])
        } catch (err) {
            console.error('Failed to load comments:', err.message)
        }
    }

    const fetchTransactionHistory = async (tokenIdVal) => {
        if (!tokenIdVal) return
        setTxHistoryLoading(true)
        try {
            const res = await transactionsAPI.getByTokenId(tokenIdVal)
            setTransactions(res.data.transactions || [])
        } catch (err) {
            console.error('Failed to load transactions:', err.message)
        } finally {
            setTxHistoryLoading(false)
        }
    }

    const handleBuy = async () => {
        if (!isConnected) { await connect(); return }
        setTxLoading(true)
        setTxError('')
        setTxSuccess('')
        try {
            const sellerAddress = nft.ownerAddress || nft.creatorAddress
            if (!sellerAddress) {
                throw new Error('Seller wallet address not found')
            }

            // Execute ETH payment via MetaMask directly to the seller address
            const txReceipt = await web3Service.buyNFT(nft.tokenId || nft._id, nft.price, sellerAddress)
            const txHash = txReceipt.txHash || txReceipt.hash || '0x_placeholder_hash'

            // Save purchase & transaction history log to MongoDB
            await nftAPI.buy(nft._id, {
                buyerAddress: account,
                txHash,
                price: nft.price,
            })

            setTxSuccess('🎉 NFT purchased successfully! ETH payment sent via MetaMask & history saved in MongoDB.')
            await fetchNFT()
            fetchTransactionHistory(nft.tokenId || nft._id)
        } catch (err) {
            setTxError(formatWeb3Error(err))
        } finally {
            setTxLoading(false)
        }
    }

    const handleTransfer = async (e) => {
        e.preventDefault()
        if (!isConnected) { await connect(); return }
        if (!recipientAddress || !recipientAddress.startsWith('0x') || recipientAddress.length !== 42) {
            setTransferError('Invalid recipient wallet address. Must be a 42-character Hex address starting with 0x.')
            return
        }
        setTransferLoading(true)
        setTransferError('')
        setTransferSuccess('')
        try {
            const contractAddr = nft.contractAddress || import.meta.env.VITE_CONTRACT_ADDRESS
            if (!contractAddr) throw new Error('Contract address not found for this NFT')

            // Execute safeTransferFrom via Web3Service
            const receipt = await web3Service.transferNFT(contractAddr, account, recipientAddress, nft.tokenId)
            const txHash = receipt.hash || receipt.transactionHash || '0x_placeholder_transfer_hash'

            // Log transaction
            await transactionsAPI.create({
                tokenId: nft.tokenId,
                txHash,
                from: nft.ownerAddress || account,
                to: recipientAddress,
                price: 0,
                type: 'transfer',
            })

            // Update MongoDB owner
            await nftAPI.update(nft._id, {
                ownerAddress: recipientAddress,
                status: 'unlisted'
            })

            setTransferSuccess('🎉 NFT transferred successfully!')
            setRecipientAddress('')
            setTimeout(() => {
                setShowTransferForm(false)
                setTransferSuccess('')
            }, 2000)
            fetchNFT()
        } catch (err) {
            setTransferError(err.message || 'Transfer failed')
        } finally {
            setTransferLoading(false)
        }
    }

    const handleLike = async () => {
        try {
            let guestId = ''
            try {
                guestId = localStorage.getItem('epicmint_guest_id') || ''
                if (!guestId) {
                    guestId = 'guest_' + Math.random().toString(36).substring(2, 11)
                    localStorage.setItem('epicmint_guest_id', guestId)
                }
            } catch {}
            const userIdentifier = (user?.walletAddress || account || user?._id || guestId).toLowerCase()
            const res = await nftAPI.like(id, { userAddress: userIdentifier })
            if (res.data && typeof res.data.likes === 'number') {
                setNft(prev => ({ ...prev, likes: res.data.likes }))
            }
        } catch { }
    }

    const handlePostComment = async (e) => {
        e.preventDefault()
        if (!commentText.trim()) return
        setCommentLoading(true)
        setCommentError('')
        try {
            const res = await commentsAPI.create(id, commentText.trim())
            setComments(prev => [res.data.comment, ...prev])
            setCommentText('')
        } catch (err) {
            setCommentError(err.response?.data?.message || err.message || 'Failed to post comment')
        } finally {
            setCommentLoading(false)
        }
    }

    const handleDeleteComment = async (commentId) => {
        try {
            await commentsAPI.delete(commentId)
            setComments(prev => prev.filter(c => c._id !== commentId))
        } catch (err) {
            console.error('Failed to delete comment:', err.message)
        }
    }

    if (loading) {
        return (
            <div style={{ padding: '4rem 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                        <div className="skeleton" style={{ width: '100%', aspectRatio: '1/1', borderRadius: 'var(--radius-lg)' }} />
                        <div>
                            {[80, 50, 100, 40, 30].map((w, i) => (
                                <div key={i} className="skeleton" style={{ height: i === 0 ? 32 : 18, width: `${w}%`, marginBottom: 16 }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !nft) {
        return (
            <div className="empty-state" style={{ padding: '6rem 0' }}>
                <div className="empty-state-icon">😕</div>
                <div className="empty-state-title">{error || 'NFT not found'}</div>
                <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/marketplace')}>
                    Back to Marketplace
                </button>
            </div>
        )
    }

    const isOwner = account && (nft.ownerAddress?.toLowerCase() === account.toLowerCase() || (user?.walletAddress && nft.ownerAddress?.toLowerCase() === user.walletAddress.toLowerCase()))

    return (
        <div style={{ padding: '2.5rem 0 5rem' }}>
            <div className="container">
                {/* Breadcrumb */}
                <nav style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <button onClick={() => navigate('/marketplace')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        Marketplace
                    </button>
                    {' / '}
                    <span style={{ color: 'var(--text-primary)' }}>{nft.title}</span>
                </nav>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start', marginBottom: '3rem' }}>
                    {/* Image */}
                    <div>
                        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                            <img
                                src={nft.imageUrl || `https://picsum.photos/seed/${id}/600`}
                                alt={nft.title}
                                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }}
                                onError={(e) => { e.target.src = `https://picsum.photos/seed/${id}/600` }}
                            />
                        </div>
                        {/* IPFS link */}
                        {nft.ipfsHash && (
                            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                                <a href={`https://gateway.pinata.cloud/ipfs/${nft.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="text-sm text-accent">
                                    View Asset on IPFS ↗
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        {/* Tags */}
                        <div className="flex gap-2" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
                            {nft.category && <span className="badge badge-primary">{nft.category}</span>}
                            <span className={`badge ${nft.status === 'listed' ? 'badge-success' : 'badge-muted'}`}>{nft.status}</span>
                            {nft.tokenId && <span className="badge badge-info">Token #{nft.tokenId}</span>}
                        </div>

                        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>{nft.title}</h1>

                        <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
                            <div className="text-sm text-muted">
                                Created by <span style={{ color: 'var(--brand-purple-light)', fontWeight: 600 }}>
                                    {nft.creator?.username || `${nft.creatorAddress?.slice(0, 6)}...${nft.creatorAddress?.slice(-4)}`}
                                </span>
                            </div>
                            <button
                                onClick={handleLike}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-primary)', fontSize: '0.875rem' }}
                            >
                                ❤️ {nft.likes || 0}
                            </button>
                            <span className="text-sm text-muted">👁️ {nft.views || 0}</span>
                        </div>

                        <p className="text-secondary" style={{ lineHeight: 1.8, marginBottom: '1.5rem' }}>{nft.description}</p>

                        {/* Price card */}
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="text-xs text-muted" style={{ marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {nft.status === 'listed' ? 'Current Price' : 'Last Price'}
                            </div>
                            <div style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: 'var(--font-display)' }} className="gradient-text">
                                {nft.price} {nft.currency || 'ETH'}
                            </div>
                            {nft.royaltyPercentage > 0 && (
                                <div className="text-xs text-muted" style={{ marginTop: '0.5rem' }}>
                                    Creator royalty: {nft.royaltyPercentage / 100}%
                                </div>
                            )}
                        </div>

                        {/* Feedback */}
                        {txError && <div className="alert alert-error mb-3">⚠️ {txError}</div>}
                        {txSuccess && <div className="alert alert-success mb-3">{txSuccess}</div>}

                        {/* Action buttons */}
                        <div className="flex flex-col gap-3 mb-4">
                            {!isOwner && nft.status !== 'sold' && (
                                <button
                                    className="btn btn-primary btn-lg w-full"
                                    onClick={handleBuy}
                                    disabled={txLoading}
                                    id="buy-nft-btn"
                                >
                                    {txLoading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Processing MetaMask Payment...</> : `🛒 Buy NFT for ${nft.price} ETH`}
                                </button>
                            )}

                            {isOwner && (
                                <div className="alert alert-info" style={{ textAlign: 'center' }}>
                                    ✨ You own this NFT ({account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Active Wallet'})
                                </div>
                            )}

                            {nft.status === 'sold' && !isOwner && (
                                <div className="alert alert-warning" style={{ textAlign: 'center' }}>
                                    🏷️ This NFT has already been purchased.
                                </div>
                            )}

                            {!isConnected && !isOwner && nft.status !== 'sold' && (
                                <button className="btn btn-ghost btn-lg w-full" onClick={connect}>
                                    🔗 Connect Wallet to Buy
                                </button>
                            )}

                            {/* Share & Transfer Controls */}
                            <div className="flex gap-2">
                                <button
                                    className="btn btn-secondary w-full"
                                    onClick={() => setShowShareMenu(prev => !prev)}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    📤 Share NFT
                                </button>

                                {isOwner && nft.tokenId && (
                                    <button
                                        className="btn btn-primary w-full"
                                        onClick={() => setShowTransferForm(prev => !prev)}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        ✈️ Transfer NFT
                                    </button>
                                )}
                            </div>

                            {/* Share Menu Popup */}
                            {showShareMenu && (
                                <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-input)', marginTop: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>📤 Share Options</span>
                                        <button onClick={() => setShowShareMenu(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
                                    </div>

                                    {shareCopiedText && <div className="alert alert-success" style={{ fontSize: '0.8rem', padding: '0.5rem', marginBottom: '0.75rem' }}>{shareCopiedText}</div>}

                                    {/* QR Code and Social Links Side-by-Side */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                        <QRCode value={window.location.href} size={100} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <a
                                                href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this awesome NFT on EpicMint: ' + window.location.href)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary btn-sm"
                                                style={{ textAlign: 'left', display: 'block', fontSize: '0.8rem' }}
                                            >
                                                💬 Share to WhatsApp
                                            </a>
                                            <a
                                                href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out this awesome NFT on EpicMint')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary btn-sm"
                                                style={{ textAlign: 'left', display: 'block', fontSize: '0.8rem' }}
                                            >
                                                ✈️ Share to Telegram
                                            </a>
                                            <a
                                                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out this awesome NFT on @EpicMint')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary btn-sm"
                                                style={{ textAlign: 'left', display: 'block', fontSize: '0.8rem' }}
                                            >
                                                🐦 Share to X (Twitter)
                                            </a>
                                            <a
                                                href={`mailto:?subject=${encodeURIComponent(nft.title + ' NFT')}&body=${encodeURIComponent('Check out this awesome NFT on EpicMint: ' + window.location.href)}`}
                                                className="btn btn-secondary btn-sm"
                                                style={{ textAlign: 'left', display: 'block', fontSize: '0.8rem' }}
                                            >
                                                ✉️ Share via Email
                                            </a>
                                        </div>
                                    </div>

                                    {/* Copy Fields list */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {[
                                            { label: 'Copy NFT Link', value: window.location.href },
                                            { label: 'Copy Token ID', value: nft.tokenId },
                                            { label: 'Copy Contract Address', value: nft.contractAddress || 'Not Minted' },
                                            { label: 'Copy Metadata URI', value: nft.metadataURI || nft.ipfsMetadataHash || 'No URI' },
                                            { label: 'Copy IPFS CID', value: nft.ipfsCID || nft.ipfsHash || 'No CID' }
                                        ].map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                                                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(item.value)
                                                        setShareCopiedText(`✓ Copied: ${item.label.replace('Copy ', '')}`)
                                                        setTimeout(() => setShareCopiedText(''), 2000)
                                                    }}
                                                    style={{ background: 'none', border: 'none', color: 'var(--brand-purple-light)', cursor: 'pointer', fontWeight: 700 }}
                                                    disabled={!item.value || item.value === 'Not Minted'}
                                                >
                                                    📋 Copy
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Transfer Form block */}
                            {showTransferForm && isOwner && nft.tokenId && (
                                <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-input)', marginTop: '0.5rem' }}>
                                    <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.75rem' }}>✈️ Transfer NFT ownership</h4>

                                    {transferError && <div className="alert alert-error" style={{ fontSize: '0.8rem', padding: '0.5rem', marginBottom: '0.75rem' }}>⚠️ {transferError}</div>}
                                    {transferSuccess && <div className="alert alert-success" style={{ fontSize: '0.8rem', padding: '0.5rem', marginBottom: '0.75rem' }}>{transferSuccess}</div>}

                                    <form onSubmit={handleTransfer}>
                                        <div className="form-group mb-3">
                                            <label className="form-label" htmlFor="recipientAddress" style={{ fontSize: '0.8rem' }}>Recipient Wallet Address</label>
                                            <input
                                                id="recipientAddress"
                                                type="text"
                                                className="form-control"
                                                placeholder="0x1234...abcd"
                                                value={recipientAddress}
                                                onChange={(e) => setRecipientAddress(e.target.value)}
                                                required
                                                disabled={transferLoading}
                                            />
                                            <p className="text-xs text-muted mt-1">Warning: Transfers are permanent on-chain actions. Ensure the address is correct.</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-sm w-full"
                                                disabled={transferLoading}
                                            >
                                                {transferLoading ? 'Transferring...' : 'Execute Transfer'}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => setShowTransferForm(false)}
                                                disabled={transferLoading}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Technical Metadata block */}
                        <div className="card" style={{ padding: '1.25rem', marginTop: '1.5rem', background: 'var(--bg-input)' }}>
                            <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>⛓️ Technical Specifications</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Smart Contract:</span>
                                    <a
                                        href={`https://sepolia.etherscan.io/address/${nft.contractAddress || import.meta.env.VITE_CONTRACT_ADDRESS}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontFamily: 'monospace', color: 'var(--brand-purple-light)', textDecoration: 'none' }}
                                    >
                                        {(nft.contractAddress || import.meta.env.VITE_CONTRACT_ADDRESS || '0x_placeholder')?.slice(0, 8)}... ↗
                                    </a>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Token ID:</span>
                                    <span style={{ fontWeight: 700 }}>#{nft.tokenId || 'Unminted (Pending)'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Blockchain Network:</span>
                                    <span style={{ textTransform: 'capitalize' }}>{nft.chainId === 11155111 ? 'Sepolia Testnet' : 'Localhost Chain'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>IPFS Asset CID:</span>
                                    <a
                                        href={`https://gateway.pinata.cloud/ipfs/${nft.ipfsCID || nft.ipfsHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontFamily: 'monospace', color: 'var(--brand-purple-light)', textDecoration: 'none' }}
                                    >
                                        {(nft.ipfsCID || nft.ipfsHash || 'No IPFS asset')?.slice(0, 12)}... ↗
                                    </a>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>IPFS Metadata CID:</span>
                                    <a
                                        href={`https://gateway.pinata.cloud/ipfs/${nft.ipfsMetadataHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontFamily: 'monospace', color: 'var(--brand-purple-light)', textDecoration: 'none' }}
                                    >
                                        {(nft.ipfsMetadataHash || 'No Metadata')?.slice(0, 12)}... ↗
                                    </a>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Token URI:</span>
                                    <span style={{ fontFamily: 'monospace', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {nft.tokenURI || `ipfs://${nft.ipfsMetadataHash}`}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Current Owner:</span>
                                    <span style={{ fontFamily: 'monospace' }}>
                                        {nft.ownerAddress ? `${nft.ownerAddress.slice(0, 6)}...${nft.ownerAddress.slice(-4)}` : 'Not Minted'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Mint Timestamp:</span>
                                    <span>{new Date(nft.createdAt).toLocaleString()}</span>
                                </div>
                                {nft.txHash && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Mint Tx Hash:</span>
                                        <a
                                            href={`https://sepolia.etherscan.io/tx/${nft.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontFamily: 'monospace', color: 'var(--brand-purple-light)', textDecoration: 'none' }}
                                        >
                                            {nft.txHash.slice(0, 8)}... ↗
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Attributes */}
                        {nft.attributes?.length > 0 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Attributes</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {nft.attributes.map((a, i) => (
                                        <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>{a.trait_type}: </span>
                                            <span style={{ fontWeight: 600 }}>{a.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-2" style={{ gap: '3rem', alignItems: 'start' }}>
                    {/* ===== COMMENTS SECTION ===== */}
                    <div>
                        <h3 style={{ fontWeight: 800, marginBottom: '1.25rem' }}>💬 Comments ({comments.length})</h3>

                        {/* Comment Input */}
                        {isAuthenticated ? (
                            <form onSubmit={handlePostComment} style={{ marginBottom: '2rem' }}>
                                <div className="form-group mb-2">
                                    <textarea
                                        className="form-control"
                                        placeholder="Add a friendly comment..."
                                        rows={3}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        maxLength={1000}
                                        required
                                    />
                                </div>
                                {commentError && <p className="text-xs text-danger mb-2">⚠️ {commentError}</p>}
                                <button type="submit" className="btn btn-secondary btn-sm" disabled={commentLoading || !commentText.trim()}>
                                    {commentLoading ? 'Posting...' : 'Post Comment'}
                                </button>
                            </form>
                        ) : (
                            <div className="alert alert-warning mb-4" style={{ fontSize: '0.875rem' }}>
                                ℹ️ Please sign in to write comments on this digital artwork.
                            </div>
                        )}

                        {/* Comments List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {comments.length === 0 ? (
                                <p className="text-sm text-muted" style={{ fontStyle: 'italic' }}>No comments yet. Be the first to share your thoughts!</p>
                            ) : (
                                comments.map((c) => (
                                    <div key={c._id} className="card" style={{ padding: '1rem', background: 'var(--bg-input)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-brand)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                                    {c.user?.avatar ? <img src={c.user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                                                </div>
                                                <div>
                                                    <strong className="text-sm" style={{ color: 'var(--text-primary)' }}>{c.user?.username || 'Anonymous'}</strong>
                                                    <span className="text-xs text-muted" style={{ marginLeft: '0.5rem' }}>
                                                        {new Date(c.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {user && (user.id === c.user?._id || user.id === c.user || user.role === 'admin') && (
                                                <button
                                                    onClick={() => handleDeleteComment(c._id)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    title="Delete Comment"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-secondary" style={{ margin: 0, lineHeight: 1.5 }}>{c.text}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ===== TRANSACTION HISTORY ===== */}
                    <div>
                        <h3 style={{ fontWeight: 800, marginBottom: '1.25rem' }}>📊 Trade History Logs</h3>
                        <div className="card" style={{ padding: '1rem', background: 'var(--bg-card)' }}>
                            {txHistoryLoading ? (
                                <p className="text-sm text-muted">Loading transactions...</p>
                            ) : transactions.length === 0 ? (
                                <p className="text-sm text-muted" style={{ fontStyle: 'italic', margin: 0 }}>No trading transaction history recorded yet on MongoDB.</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Type</th>
                                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Price</th>
                                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>From</th>
                                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>To</th>
                                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tx Hash</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((tx) => (
                                                <tr key={tx._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                    <td style={{ padding: '0.5rem', textTransform: 'capitalize', fontWeight: 600 }}>
                                                        {tx.type === 'buy' ? '🛒 Buy' : tx.type}
                                                    </td>
                                                    <td style={{ padding: '0.5rem' }}>{tx.price} ETH</td>
                                                    <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>
                                                        {tx.from.slice(0, 4)}...{tx.from.slice(-4)}
                                                    </td>
                                                    <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>
                                                        {tx.to.slice(0, 4)}...{tx.to.slice(-4)}
                                                    </td>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        <a href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="text-accent" style={{ textDecoration: 'none' }}>
                                                            {tx.txHash.slice(0, 6)}... ↗
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NFTDetail
