import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { SkeletonCard } from './SkeletonCard'
import { nftAPI } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useWeb3 } from '../contexts/Web3Context'

function getGuestClientId() {
    try {
        let guestId = localStorage.getItem('epicmint_guest_id')
        if (!guestId) {
            guestId = 'guest_' + Math.random().toString(36).substring(2, 11)
            localStorage.setItem('epicmint_guest_id', guestId)
        }
        return guestId
    } catch {
        return 'guest_browser'
    }
}

/**
 * Premium NFT Card — Foundation / OpenSea inspired Web3 collectible card
 */
function NFTCard({ nft, loading = false }) {
    if (loading) {
        return <SkeletonCard />
    }

    if (!nft) return null

    const { user } = useAuth()
    const { account } = useWeb3()

    const userIdentifier = (user?.walletAddress || account || user?._id || getGuestClientId()).toLowerCase()
    const nftId = nft._id || nft.id

    const initialIsLiked = Array.isArray(nft.likedBy) && userIdentifier ? nft.likedBy.includes(userIdentifier) : false

    const [likesCount, setLikesCount] = useState(nft.likes || 0)
    const [isLiked, setIsLiked] = useState(initialIsLiked)
    const [likeLoading, setLikeLoading] = useState(false)

    const handleLikeClick = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (likeLoading) return
        setLikeLoading(true)

        const nextIsLiked = !isLiked
        setIsLiked(nextIsLiked)
        setLikesCount(prev => Math.max(0, prev + (nextIsLiked ? 1 : -1)))

        try {
            const res = await nftAPI.like(nftId, { userAddress: userIdentifier })
            if (res.data && typeof res.data.likes === 'number') {
                setLikesCount(res.data.likes)
                if (typeof res.data.isLiked === 'boolean') {
                    setIsLiked(res.data.isLiked)
                }
            }
        } catch (err) {
            setIsLiked(!nextIsLiked)
            setLikesCount(prev => Math.max(0, prev + (nextIsLiked ? -1 : 1)))
        } finally {
            setLikeLoading(false)
        }
    }

    const categoryColors = {
        art: 'badge-primary',
        gaming: 'badge-success',
        collectibles: 'badge-warning',
        music: 'badge-info',
        photography: 'badge-danger',
        sports: 'badge-warning',
        utility: 'badge-muted',
    }

    const statusColors = {
        minted: 'badge-success',
        listed: 'badge-primary',
        sold: 'badge-muted',
        pending: 'badge-warning',
    }

    const imageSrc = nft.imageUrl || `https://picsum.photos/seed/${nft._id || nft.id}/400`
    const creatorName = nft.creator?.username || shortenAddress(nft.creatorAddress || nft.ownerAddress)
    const creatorAvatar = nft.creator?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${creatorName}`

    return (
        <Link to={`/nft/${nft._id || nft.id}`} style={{ textDecoration: 'none', display: 'block' }}>
            <div className="nft-card animate-fade-up" role="article" aria-label={nft.title}>
                {/* Image & Badge Overlay */}
                <div className="nft-card-image-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                        src={imageSrc}
                        alt={nft.title}
                        className="nft-card-image"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = `https://picsum.photos/seed/${nft._id || nft.id}/400`
                        }}
                    />
                    <div className="nft-card-overlay">
                        <span className="btn btn-primary btn-sm">Explore Details</span>
                    </div>

                    {/* Top Badges */}
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap', zIndex: 2 }}>
                        {nft.category && (
                            <span className={`badge ${categoryColors[nft.category] || 'badge-muted'}`}>
                                {nft.category}
                            </span>
                        )}
                        {nft.status && nft.status !== 'minted' && (
                            <span className={`badge ${statusColors[nft.status] || 'badge-muted'}`}>
                                {nft.status}
                            </span>
                        )}
                    </div>

                    {/* Likes & Views */}
                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.35rem', zIndex: 2 }}>
                        {nft.views > 0 && (
                            <span className="badge badge-muted" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.5)' }}>
                                👁️ {nft.views}
                            </span>
                        )}
                        <button
                            onClick={handleLikeClick}
                            disabled={likeLoading}
                            className={`badge ${isLiked ? 'badge-primary' : 'badge-muted'}`}
                            style={{
                                backdropFilter: 'blur(8px)',
                                background: isLiked ? 'rgba(139, 92, 246, 0.85)' : 'rgba(0,0,0,0.5)',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: '#fff',
                            }}
                            title={isLiked ? 'Unlike NFT' : 'Like NFT'}
                        >
                            {isLiked ? '❤️' : '🤍'} {likesCount}
                        </button>
                    </div>
                </div>

                {/* Card Info */}
                <div className="nft-card-body">
                    {/* Creator Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <img
                            src={creatorAvatar}
                            alt={creatorName}
                            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {creatorName}
                        </span>
                        <span style={{ color: '#10b981', fontSize: '0.75rem' }} title="Verified Creator">✓</span>
                    </div>

                    {/* Title */}
                    <div className="nft-card-title mb-2">{nft.title}</div>

                    {/* Footer Row */}
                    <div className="nft-card-footer">
                        <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>Reserve Price</div>
                            <div className="nft-price" style={{ color: 'var(--brand-purple-light)', fontWeight: 800 }}>
                                {nft.price} {nft.currency || 'ETH'}
                            </div>
                        </div>
                        {nft.status === 'listed' ? (
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={(e) => e.preventDefault()}
                                id={`buy-btn-${nft._id}`}
                            >
                                Buy Now
                            </button>
                        ) : (
                            <span className="btn btn-ghost btn-sm" style={{ pointerEvents: 'none' }}>
                                View →
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}

function shortenAddress(addr) {
    if (!addr) return 'Unknown'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default NFTCard
