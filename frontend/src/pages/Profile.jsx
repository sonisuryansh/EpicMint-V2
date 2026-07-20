import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWeb3 } from '../contexts/Web3Context'
import { useAuth } from '../contexts/AuthContext'
import { nftAPI, authAPI } from '../lib/api'
import NFTCard from '../components/NFTCard'
import AuthModal from '../components/AuthModal'
import SEO from '../components/SEO'

function Profile() {
    const navigate = useNavigate()
    const { account, isConnected, connect, getShortAddress, web3Service } = useWeb3()
    const { user, isAuthenticated, linkGoogleAccount, linkWalletAddress, unlinkWalletAddress, logout, updateUser } = useAuth()

    const [tab, setTab] = useState('created')
    const [nfts, setNfts] = useState([])
    const [loading, setLoading] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [username, setUsername] = useState(user?.username || '')
    const [avatar, setAvatar] = useState(user?.avatar || '')
    const [showAuthModal, setShowAuthModal] = useState(false)

    useEffect(() => {
        if (user) {
            setUsername(user.username || '')
            setAvatar(user.avatar || '')
        }
    }, [user])

    // Account Linking State
    const [linkError, setLinkError] = useState('')
    const [linkSuccess, setLinkSuccess] = useState('')
    const googleLinkBtnRef = useRef(null)

    useEffect(() => {
        document.title = 'My Profile — EpicMint'
    }, [])

    // Load Google linking button
    useEffect(() => {
        if (!isAuthenticated || user?.googleId) return

        let timer
        const initGoogleLink = () => {
            if (window.google?.accounts?.id) {
                const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id'
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleLinkResponse,
                })

                if (googleLinkBtnRef.current) {
                    window.google.accounts.id.renderButton(googleLinkBtnRef.current, {
                        theme: 'outline',
                        size: 'medium',
                        text: 'continue_with',
                    })
                }
            } else {
                timer = setTimeout(initGoogleLink, 300)
            }
        }

        initGoogleLink()
        return () => clearTimeout(timer)
    }, [isAuthenticated, user?.googleId])

    const handleGoogleLinkResponse = async (response) => {
        setLinkError('')
        setLinkSuccess('')
        try {
            await linkGoogleAccount(response.credential)
            setLinkSuccess('✓ Google account linked successfully!')
        } catch (err) {
            setLinkError(err.message || 'Google account linking failed')
        }
    }

    const handleLinkWallet = async () => {
        setLinkError('')
        setLinkSuccess('')
        try {
            const addr = await connect()
            const nonceRes = await authAPI.getNonce(addr)
            const message = nonceRes.data.message
            const signature = await web3Service.signMessage(message)

            await linkWalletAddress(addr, signature, message)
            setLinkSuccess('✓ MetaMask wallet linked successfully!')
        } catch (err) {
            setLinkError(err.message || 'MetaMask linking failed')
        }
    }

    const handleUnlinkWallet = async () => {
        setLinkError('')
        setLinkSuccess('')
        if (!window.confirm('Are you sure you want to disconnect and unlink your MetaMask wallet from this account? You will not be able to trade or mint until you link it again.')) return
        try {
            await unlinkWalletAddress()
            setLinkSuccess('✓ MetaMask wallet unlinked successfully!')
        } catch (err) {
            setLinkError(err.message || 'MetaMask unlinking failed')
        }
    }

    const handleCopyAddress = () => {
        if (!user?.walletAddress) return
        navigator.clipboard.writeText(user.walletAddress)
        setLinkSuccess('✓ Wallet address copied to clipboard!')
        setTimeout(() => setLinkSuccess(''), 2000)
    }

    const fetchNFTs = async () => {
        const queryAddress = account || user?.walletAddress
        if (!queryAddress) return

        setLoading(true)
        try {
            const params = tab === 'created'
                ? { creatorAddress: queryAddress }
                : { ownerAddress: queryAddress }
            const res = await nftAPI.getAll(params)
            setNfts(res.data.data || [])
        } catch {
            setNfts([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNFTs()
    }, [account, user?.walletAddress, tab])

    const handleSaveProfile = async () => {
        try {
            await authAPI.updateProfile({ username, avatar })
            updateUser({ username, avatar })
            setEditMode(false)
        } catch (err) {
            console.error('Profile update failed:', err.message)
        }
    }

    if (!isAuthenticated && !isConnected) {
        return (
            <div className="empty-state" style={{ padding: '6rem 0' }}>
                <div className="empty-state-icon">👤</div>
                <div className="empty-state-title">Sign in or Connect Wallet to view your profile</div>
                <button
                    className="btn btn-primary"
                    style={{ marginTop: '1.5rem' }}
                    onClick={() => setShowAuthModal(true)}
                    id="profile-connect-btn"
                >
                    Sign In / Connect
                </button>
                <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            </div>
        )
    }

    const tabs = [
        { id: 'created', label: '🎨 Created' },
        { id: 'owned', label: '💎 Owned' },
    ]

    return (
        <div style={{ padding: '2.5rem 0 4rem' }}>
            <SEO title={`${user?.username || 'My'} Profile`} description="Manage your Web3 NFT collection, created artworks, and connected Google/MetaMask accounts." />
            <div className="container">
                {/* Profile Header */}
                <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                        {/* Avatar */}
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: 'var(--gradient-brand)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', flexShrink: 0,
                            overflow: 'hidden'
                        }}>
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : '👤'}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                            {editMode ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem', maxWidth: 360 }}>
                                    <div className="form-group mb-1">
                                        <label className="form-label text-xs">Username</label>
                                        <input
                                            className="form-control"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            placeholder="Username"
                                        />
                                    </div>
                                    <div className="form-group mb-2">
                                        <label className="form-label text-xs">Profile Picture / Google Avatar URL</label>
                                        <input
                                            className="form-control"
                                            value={avatar}
                                            onChange={e => setAvatar(e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="btn btn-primary btn-sm" onClick={handleSaveProfile}>Save Changes</button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                                    <h2 style={{ fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>
                                        {user?.username || getShortAddress(account) || 'Anonymous'}
                                    </h2>
                                    {isAuthenticated && (
                                        <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(true)}>✏️ Edit</button>
                                    )}
                                </div>
                            )}

                            {/* Addresses/Info */}
                            <div className="flex flex-col gap-1 mt-2">
                                {user?.email && (
                                    <div className="text-sm text-secondary">
                                        📧 {user.email}
                                    </div>
                                )}
                                {(account || user?.walletAddress) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', maxWidth: '100%' }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.825rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-sm)', wordBreak: 'break-all', maxWidth: '100%' }}>
                                            {account || user?.walletAddress}
                                        </span>
                                        {isConnected && (
                                            <span className="badge badge-success">
                                                <span className="wallet-dot" style={{ width: 6, height: 6 }} />
                                                Active Wallet
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/create')}
                            >
                                ✨ Create NFT
                            </button>
                            <button
                                className="btn btn-ghost"
                                onClick={() => {
                                    logout()
                                    if (isConnected) disconnect()
                                }}
                            >
                                🚪 Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Linked Accounts Modernization Section */}
                <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <h4 style={{ fontWeight: 800, marginBottom: '1rem' }}>🔗 Connected Security Accounts</h4>
                    <p className="text-sm text-secondary mb-4">
                        Intelligently link multiple providers to log in to this account using MetaMask, Google, or Email credentials.
                    </p>

                    {linkSuccess && <div className="alert alert-success mb-3">{linkSuccess}</div>}
                    {linkError && <div className="alert alert-error mb-3">{linkError}</div>}

                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                        {/* Google OAuth Link */}
                        <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-input)' }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Google Authentication</div>
                            {user?.googleId ? (
                                <div className="text-success text-sm flex items-center gap-1">
                                    ✓ Google Sign-In Linked (ID: {user.googleId.slice(0, 10)}...)
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs text-muted mb-2">Connect Google Sign-In to log in w/ Google OAuth.</p>
                                    <div ref={googleLinkBtnRef} />
                                </div>
                            )}
                        </div>

                        {/* MetaMask Link */}
                        <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-input)' }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>MetaMask Wallet Link</div>
                            {user?.walletAddress ? (
                                <div>
                                    <div className="text-success text-sm flex items-center gap-1 mb-2" style={{ color: '#10b981' }}>
                                        ✓ Wallet Linked: <strong>{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</strong>
                                    </div>
                                    <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopyAddress} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                            📋 Copy Address
                                        </button>
                                        {isConnected && account?.toLowerCase() === user.walletAddress.toLowerCase() ? (
                                            <span className="text-xs text-muted" style={{ padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                🟢 Connected &amp; Reconnected
                                            </span>
                                        ) : (
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={connect} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                                🦊 Reconnect Wallet
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" className="btn btn-primary btn-sm" onClick={handleLinkWallet}>
                                            🔄 Change Wallet
                                        </button>
                                        <button type="button" className="btn btn-danger btn-sm" onClick={handleUnlinkWallet}>
                                            ✕ Disconnect Wallet
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs text-muted mb-2">Link MetaMask to enable NFT minting, lists, and trades.</p>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={handleLinkWallet}
                                    >
                                        🦊 Link MetaMask Wallet
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '0.375rem', width: 'fit-content' }}>
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: 'calc(var(--radius-md) - 2px)',
                                background: tab === t.id ? 'var(--gradient-brand)' : 'transparent',
                                color: tab === t.id ? '#fff' : 'var(--text-secondary)',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: tab === t.id ? 700 : 500,
                                fontSize: '0.875rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* NFT Grid */}
                {loading ? (
                    <div className="nft-grid">
                        {Array.from({ length: 4 }).map((_, i) => <NFTCard key={i} loading />)}
                    </div>
                ) : nfts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">{tab === 'created' ? '🎨' : '💎'}</div>
                        <div className="empty-state-title">
                            {tab === 'created' ? 'You haven\'t created any NFTs yet' : 'You don\'t own any NFTs yet'}
                        </div>
                        <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
                            {tab === 'created' ? 'Start by creating your first NFT' : 'Browse the marketplace to buy NFTs'}
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '1.5rem' }}
                            onClick={() => navigate(tab === 'created' ? '/create' : '/marketplace')}
                        >
                            {tab === 'created' ? '✨ Create NFT' : '🏪 Browse Marketplace'}
                        </button>
                    </div>
                ) : (
                    <div className="nft-grid">
                        {nfts.map(nft => <NFTCard key={nft._id || nft.id} nft={nft} />)}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile
