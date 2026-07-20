import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { nftAPI, authAPI } from '../lib/api'
import { getDemoNFTs } from '../lib/demoData'
import NFTCard from '../components/NFTCard'
import { useWeb3 } from '../contexts/Web3Context'
import { useAuth } from '../contexts/AuthContext'
import SEO from '../components/SEO'

const COIN_DATA = {
    ETH: {
        name: 'Ethereum',
        symbol: 'ETH',
        icon: 'Ξ',
        unit: 'ETH',
        timeframes: {
            '1D': {
                price: '2,845.50 USD',
                change: '+4.2%',
                isPositive: true,
                peak: '2,890.00 USD',
                dip: '2,710.20 USD',
                volume: '14.82B USD',
                points: '0,140 100,110 200,150 300,80 400,100 500,45 600,70 700,30 800,20',
                fillPoints: '0,200 0,140 100,110 200,150 300,80 400,100 500,45 600,70 700,30 800,20 800,200',
                lastY: 20,
            },
            '1W': {
                price: '2,920.10 USD',
                change: '+12.8%',
                isPositive: true,
                peak: '3,050.00 USD',
                dip: '2,580.00 USD',
                volume: '98.50B USD',
                points: '0,160 100,140 200,120 300,130 400,70 500,50 600,60 700,35 800,15',
                fillPoints: '0,200 0,160 100,140 200,120 300,130 400,70 500,50 600,60 700,35 800,15 800,200',
                lastY: 15,
            },
            '1M': {
                price: '2,650.00 USD',
                change: '-2.4%',
                isPositive: false,
                peak: '3,120.00 USD',
                dip: '2,420.00 USD',
                volume: '410.20B USD',
                points: '0,40 100,60 200,50 300,110 400,140 500,120 600,150 700,130 800,165',
                fillPoints: '0,200 0,40 100,60 200,50 300,110 400,140 500,120 600,150 700,130 800,165 800,200',
                lastY: 165,
            },
            '1Y': {
                price: '3,450.80 USD',
                change: '+64.5%',
                isPositive: true,
                peak: '4,090.00 USD',
                dip: '1,520.00 USD',
                volume: '2.14T USD',
                points: '0,180 100,170 200,150 300,130 400,90 500,80 600,40 700,30 800,10',
                fillPoints: '0,200 0,180 100,170 200,150 300,130 400,90 500,80 600,40 700,30 800,10 800,200',
                lastY: 10,
            },
            'ALL': {
                price: '2,845.50 USD',
                change: '+420.8%',
                isPositive: true,
                peak: '4,890.00 USD',
                dip: '0.42 USD',
                volume: '18.5T USD',
                points: '0,195 100,190 200,185 300,160 400,140 500,100 600,70 700,40 800,15',
                fillPoints: '0,200 0,195 100,190 200,185 300,160 400,140 500,100 600,70 700,40 800,15 800,200',
                lastY: 15,
            },
        },
    },
    BTC: {
        name: 'Bitcoin',
        symbol: 'BTC',
        icon: '₿',
        unit: 'BTC',
        timeframes: {
            '1D': {
                price: '68,450.00 USD',
                change: '+2.8%',
                isPositive: true,
                peak: '69,200.00 USD',
                dip: '66,800.00 USD',
                volume: '34.20B USD',
                points: '0,130 100,120 200,100 300,110 400,70 500,60 600,45 700,30 800,25',
                fillPoints: '0,200 0,130 100,120 200,100 300,110 400,70 500,60 600,45 700,30 800,25 800,200',
                lastY: 25,
            },
            '1W': {
                price: '71,200.00 USD',
                change: '+8.4%',
                isPositive: true,
                peak: '73,500.00 USD',
                dip: '64,900.00 USD',
                volume: '210.40B USD',
                points: '0,150 100,130 200,140 300,90 400,60 500,40 600,50 700,25 800,15',
                fillPoints: '0,200 0,150 100,130 200,140 300,90 400,60 500,40 600,50 700,25 800,15 800,200',
                lastY: 15,
            },
            '1M': {
                price: '63,100.00 USD',
                change: '-4.1%',
                isPositive: false,
                peak: '71,800.00 USD',
                dip: '60,200.00 USD',
                volume: '840.10B USD',
                points: '0,35 100,50 200,40 300,100 400,120 500,140 600,130 700,150 800,170',
                fillPoints: '0,200 0,35 100,50 200,40 300,100 400,120 500,140 600,130 700,150 800,170 800,200',
                lastY: 170,
            },
            '1Y': {
                price: '68,450.00 USD',
                change: '+115.2%',
                isPositive: true,
                peak: '73,750.00 USD',
                dip: '28,400.00 USD',
                volume: '4.80T USD',
                points: '0,185 100,175 200,160 300,120 400,80 500,60 600,35 700,20 800,10',
                fillPoints: '0,200 0,185 100,175 200,160 300,120 400,80 500,60 600,35 700,20 800,10 800,200',
                lastY: 10,
            },
            'ALL': {
                price: '68,450.00 USD',
                change: '+1,850.0%',
                isPositive: true,
                peak: '73,750.00 USD',
                dip: '0.05 USD',
                volume: '42.0T USD',
                points: '0,198 100,195 200,190 300,180 400,140 500,100 600,50 700,30 800,10',
                fillPoints: '0,200 0,198 100,195 200,190 300,180 400,140 500,100 600,50 700,30 800,10 800,200',
                lastY: 10,
            },
        },
    },
    SOL: {
        name: 'Solana',
        symbol: 'SOL',
        icon: '◎',
        unit: 'SOL',
        timeframes: {
            '1D': {
                price: '184.20 USD',
                change: '+9.5%',
                isPositive: true,
                peak: '189.50 USD',
                dip: '168.00 USD',
                volume: '8.40B USD',
                points: '0,150 100,130 200,140 300,90 400,80 500,50 600,60 700,30 800,15',
                fillPoints: '0,200 0,150 100,130 200,140 300,90 400,80 500,50 600,60 700,30 800,15 800,200',
                lastY: 15,
            },
            '1W': {
                price: '192.00 USD',
                change: '+22.4%',
                isPositive: true,
                peak: '205.00 USD',
                dip: '152.00 USD',
                volume: '42.10B USD',
                points: '0,170 100,150 200,130 300,100 400,70 500,45 600,35 700,20 800,10',
                fillPoints: '0,200 0,170 100,150 200,130 300,100 400,70 500,45 600,35 700,20 800,10 800,200',
                lastY: 10,
            },
            '1M': {
                price: '162.50 USD',
                change: '-5.8%',
                isPositive: false,
                peak: '208.00 USD',
                dip: '145.00 USD',
                volume: '120.50B USD',
                points: '0,40 100,55 200,70 300,120 400,150 500,130 600,160 700,140 800,175',
                fillPoints: '0,200 0,40 100,55 200,70 300,120 400,150 500,130 600,160 700,140 800,175 800,200',
                lastY: 175,
            },
            '1Y': {
                price: '184.20 USD',
                change: '+310.5%',
                isPositive: true,
                peak: '210.00 USD',
                dip: '18.50 USD',
                volume: '640.00B USD',
                points: '0,190 100,185 200,170 300,140 400,100 500,70 600,45 700,25 800,12',
                fillPoints: '0,200 0,190 100,185 200,170 300,140 400,100 500,70 600,45 700,25 800,12 800,200',
                lastY: 12,
            },
            'ALL': {
                price: '184.20 USD',
                change: '+1,240.0%',
                isPositive: true,
                peak: '260.00 USD',
                dip: '0.50 USD',
                volume: '2.40T USD',
                points: '0,198 100,192 200,180 300,160 400,110 500,60 600,40 700,20 800,15',
                fillPoints: '0,200 0,198 100,192 200,180 300,160 400,110 500,60 600,40 700,20 800,15 800,200',
                lastY: 15,
            },
        },
    },
    MATIC: {
        name: 'Polygon',
        symbol: 'MATIC',
        icon: '💜',
        unit: 'MATIC',
        timeframes: {
            '1D': {
                price: '0.854 USD',
                change: '+6.1%',
                isPositive: true,
                peak: '0.890 USD',
                dip: '0.795 USD',
                volume: '1.25B USD',
                points: '0,140 100,125 200,135 300,95 400,85 500,60 600,50 700,35 800,20',
                fillPoints: '0,200 0,140 100,125 200,135 300,95 400,85 500,60 600,50 700,35 800,20 800,200',
                lastY: 20,
            },
            '1W': {
                price: '0.910 USD',
                change: '+14.2%',
                isPositive: true,
                peak: '0.950 USD',
                dip: '0.760 USD',
                volume: '8.40B USD',
                points: '0,165 100,145 200,130 300,110 400,80 500,55 600,40 700,25 800,15',
                fillPoints: '0,200 0,165 100,145 200,130 300,110 400,80 500,55 600,40 700,25 800,15 800,200',
                lastY: 15,
            },
            '1M': {
                price: '0.780 USD',
                change: '-3.2%',
                isPositive: false,
                peak: '0.980 USD',
                dip: '0.720 USD',
                volume: '34.80B USD',
                points: '0,45 100,60 200,50 300,105 400,135 500,125 600,155 700,140 800,168',
                fillPoints: '0,200 0,45 100,60 200,50 300,105 400,135 500,125 600,155 700,140 800,168 800,200',
                lastY: 168,
            },
            '1Y': {
                price: '0.854 USD',
                change: '+45.8%',
                isPositive: true,
                peak: '1.280 USD',
                dip: '0.480 USD',
                volume: '140.00B USD',
                points: '0,185 100,170 200,150 300,125 400,95 500,75 600,45 700,30 800,18',
                fillPoints: '0,200 0,185 100,170 200,150 300,125 400,95 500,75 600,45 700,30 800,18 800,200',
                lastY: 18,
            },
            'ALL': {
                price: '0.854 USD',
                change: '+840.0%',
                isPositive: true,
                peak: '2.920 USD',
                dip: '0.003 USD',
                volume: '620.00B USD',
                points: '0,196 100,190 200,182 300,160 400,115 500,65 600,45 700,25 800,15',
                fillPoints: '0,200 0,196 100,190 200,182 300,160 400,115 500,65 600,45 700,25 800,15 800,200',
                lastY: 15,
            },
        },
    },
    EPI: {
        name: 'EpicMint Index',
        symbol: 'EPI',
        icon: '⚡',
        unit: 'EPI',
        timeframes: {
            '1D': {
                price: '14.80 USD',
                change: '+18.5%',
                isPositive: true,
                peak: '15.40 USD',
                dip: '12.10 USD',
                volume: '4.10M USD',
                points: '0,155 100,135 200,145 300,95 400,75 500,50 600,40 700,25 800,12',
                fillPoints: '0,200 0,155 100,135 200,145 300,95 400,75 500,50 600,40 700,25 800,12 800,200',
                lastY: 12,
            },
            '1W': {
                price: '16.50 USD',
                change: '+42.1%',
                isPositive: true,
                peak: '17.80 USD',
                dip: '11.00 USD',
                volume: '24.50M USD',
                points: '0,175 100,155 200,135 300,105 400,75 500,45 600,30 700,18 800,8',
                fillPoints: '0,200 0,175 100,155 200,135 300,105 400,75 500,45 600,30 700,18 800,8 800,200',
                lastY: 8,
            },
            '1M': {
                price: '12.40 USD',
                change: '-1.8%',
                isPositive: false,
                peak: '18.20 USD',
                dip: '10.50 USD',
                volume: '95.10M USD',
                points: '0,50 100,65 200,55 300,110 400,140 500,130 600,150 700,135 800,160',
                fillPoints: '0,200 0,50 100,65 200,55 300,110 400,140 500,130 600,150 700,135 800,160 800,200',
                lastY: 160,
            },
            '1Y': {
                price: '14.80 USD',
                change: '+185.4%',
                isPositive: true,
                peak: '22.40 USD',
                dip: '4.20 USD',
                volume: '420.00M USD',
                points: '0,188 100,172 200,152 300,128 400,92 500,68 600,40 700,22 800,10',
                fillPoints: '0,200 0,188 100,172 200,152 300,128 400,92 500,68 600,40 700,22 800,10 800,200',
                lastY: 10,
            },
            'ALL': {
                price: '14.80 USD',
                change: '+680.0%',
                isPositive: true,
                peak: '24.00 USD',
                dip: '1.00 USD',
                volume: '1.80B USD',
                points: '0,195 100,188 200,178 300,155 400,105 500,55 600,35 700,18 800,10',
                fillPoints: '0,200 0,195 100,188 200,178 300,155 400,105 500,55 600,35 700,18 800,10 800,200',
                lastY: 10,
            },
        },
    },
}

function Home() {
    const navigate = useNavigate()
    const { account, isConnected, connect } = useWeb3()
    const { user, isAuthenticated } = useAuth()
    const [nfts, setNfts] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedTimeframe, setSelectedTimeframe] = useState('1D')
    const [selectedCoin, setSelectedCoin] = useState('ETH')
    const [followingMap, setFollowingMap] = useState({})

    const activeCoinData = COIN_DATA[selectedCoin] || COIN_DATA.ETH
    const activeTF = activeCoinData.timeframes[selectedTimeframe] || activeCoinData.timeframes['1D']

    const handleToggleFollow = async (targetAddress) => {
        const isSelf = (account && account.toLowerCase() === targetAddress.toLowerCase()) ||
            (user && user.walletAddress?.toLowerCase() === targetAddress.toLowerCase())
        if (isSelf) {
            alert('You cannot follow your own account!')
            return
        }
        if (!isAuthenticated && !isConnected) {
            alert('Please sign in or connect your wallet to follow creators!')
            return
        }
        try {
            const isCurrentlyFollowing = !!followingMap[targetAddress]
            setFollowingMap(prev => ({ ...prev, [targetAddress]: !isCurrentlyFollowing }))
            await authAPI.followUser(targetAddress)
        } catch (err) {
            console.error('Follow toggle error:', err.message)
        }
    }

    useEffect(() => {
        document.title = 'EpicMint — The NFT Marketplace for Creators'
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [nftsRes, statsRes] = await Promise.all([
                nftAPI.getAll({ limit: 50, sort: 'newest' }),
                nftAPI.getStats(),
            ])
            setNfts(nftsRes.data.data || [])
            setStats(statsRes.data.data)
        } catch (err) {
            setError('Backend not connected — showing demo data')
            setNfts(getDemoNFTs())
            setStats({ totalNFTs: 1240, totalMinted: 890, totalListed: 145 })
        } finally {
            setLoading(false)
        }
    }

    // Group NFTs by creator to extract all users & their post details
    const creatorsMap = {}
    nfts.forEach(nft => {
        const addr = (nft.creatorAddress || nft.ownerAddress || '0x0000000000000000000000000000000000000000').toLowerCase()
        if (!creatorsMap[addr]) {
            creatorsMap[addr] = {
                walletAddress: addr,
                username: nft.creator?.username || `User_${addr.slice(2, 8)}`,
                avatar: nft.creator?.avatar || '',
                followersCount: nft.creator?.followers?.length || 0,
                nfts: [],
                totalViews: 0,
                totalLikes: 0,
            }
        }
        creatorsMap[addr].nfts.push(nft)
        creatorsMap[addr].totalViews += (nft.views || 0)
        creatorsMap[addr].totalLikes += (nft.likes || 0)
    })
    const creatorList = Object.values(creatorsMap)

    const statItems = [
        { label: 'Total NFTs', value: stats?.totalNFTs?.toLocaleString() || '—' },
        { label: 'Minted', value: stats?.totalMinted?.toLocaleString() || '—' },
        { label: 'Listed', value: stats?.totalListed?.toLocaleString() || '—' },
        { label: 'Creators', value: creatorList.length ? `${creatorList.length} Active` : '500+' },
    ]

    return (
        <div>
            <SEO title="Home — EpicMint NFT Marketplace" description="The next-generation Web3 NFT Marketplace for digital creators and collectors. Powered by OpenZeppelin v5 and Pinata IPFS." />
            {/* ===== HERO SECTION ===== */}
            <section className="hero-section" aria-label="Hero">
                <div className="hero-bg" />
                <div className="hero-orb hero-orb-1" aria-hidden="true" />
                <div className="hero-orb hero-orb-2" aria-hidden="true" />
                <div className="hero-orb hero-orb-3" aria-hidden="true" />

                <div className="container hero-content">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                        <div className="animate-fade-up">
                            <div className="section-tag">⚡ Next-gen NFT Platform</div>
                            <h1 className="display-hero" style={{ marginBottom: '1.5rem' }}>
                                Create, Buy &amp; Sell
                                <br />
                                <span className="gradient-text">Digital Assets</span>
                            </h1>
                            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', lineHeight: 1.7, maxWidth: 480 }}>
                                The world's most advanced NFT marketplace. Mint your creations, trade with confidence, and earn royalties forever.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={() => navigate('/marketplace')}
                                    id="hero-explore-btn"
                                >
                                    🎨 Explore NFTs
                                </button>
                                <button
                                    className="btn btn-ghost btn-lg"
                                    onClick={() => navigate('/create')}
                                    style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                                    id="hero-create-btn"
                                >
                                    ✨ Create Now
                                </button>
                            </div>

                            {/* Mini stats */}
                            <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                                {statItems.map(s => (
                                    <div key={s.label}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>
                                            {s.value}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {s.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hero featured card */}
                        <div className="animate-fade-up delay-200" style={{ display: 'flex', justifyContent: 'center' }}>
                            <HeroFeaturedCard />
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== LATEST NFTS ===== */}
            <section aria-label="Latest NFTs" style={{ padding: '5rem 0' }}>
                <div className="container">
                    <div className="section-header">
                        <div className="section-tag">🔥 Trending Now</div>
                        <h2 className="display-section gradient-text">Latest NFTs</h2>
                        <p className="text-secondary" style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>
                            Discover the freshest digital collectibles from our creators
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-warning" style={{ maxWidth: 600, margin: '0 auto 2rem' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="nft-grid">
                        {loading
                            ? Array.from({ length: 8 }).map((_, i) => <NFTCard key={i} loading />)
                            : nfts.slice(0, 8).map((nft) => <NFTCard key={nft._id || nft.id} nft={nft} />)
                        }
                    </div>

                    {!loading && (
                        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                            <Link to="/marketplace" className="btn btn-secondary btn-lg">
                                View All NFTs →
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ===== CREATOR ACTIVITY & LIVE NFT STOCK GRAPH SECTION ===== */}
            <section aria-label="Built for Creators & Market Analytics" style={{ padding: '5rem 0', background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="section-header">
                        <div className="section-tag">📈 Live Market Analytics &amp; Creators</div>
                        <h2 className="display-section">Built for Creators</h2>
                        <p className="text-secondary" style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>
                            Live NFT stock graph trends, creator activity, and full user post details
                        </p>
                    </div>

                    {/* ===== 1. LIVE COIN & STOCK GRAPH ===== */}
                    <div className="card" style={{ padding: '2rem', marginBottom: '3rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        
                        {/* Coin Selector Tabs */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            {Object.keys(COIN_DATA).map(symbol => {
                                const coin = COIN_DATA[symbol]
                                const isSelected = selectedCoin === symbol
                                return (
                                    <button
                                        key={symbol}
                                        onClick={() => setSelectedCoin(symbol)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: `1px solid ${isSelected ? 'var(--brand-purple)' : 'var(--border-color)'}`,
                                            background: isSelected ? 'var(--gradient-brand)' : 'var(--bg-input)',
                                            color: '#fff',
                                            fontWeight: isSelected ? 800 : 600,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <span>{coin.icon}</span>
                                        <span>{coin.name} ({coin.symbol})</span>
                                    </button>
                                )
                            })}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: activeTF.isPositive ? '#10b981' : '#ef4444',
                                        boxShadow: `0 0 10px ${activeTF.isPositive ? '#10b981' : '#ef4444'}`
                                    }} />
                                    <span className="text-xs text-muted" style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                                        {activeCoinData.name} ({activeCoinData.symbol}) LIVE MARKET PRICE
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.25rem' }}>
                                    <span style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                                        {activeTF.price}
                                    </span>
                                    <span className={`badge ${activeTF.isPositive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                                        {activeTF.isPositive ? '▲' : '▼'} {activeTF.change} ({selectedTimeframe})
                                    </span>
                                </div>
                            </div>

                            {/* Timeframe Selectors */}
                            <div style={{ display: 'flex', gap: '0.375rem', background: 'var(--bg-input)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
                                {['1D', '1W', '1M', '1Y', 'ALL'].map((tf) => (
                                    <button
                                        key={tf}
                                        onClick={() => setSelectedTimeframe(tf)}
                                        style={{
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: 'none',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            background: selectedTimeframe === tf ? 'var(--brand-purple)' : 'transparent',
                                            color: selectedTimeframe === tf ? '#fff' : 'var(--text-muted)',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interactive SVG Stock Graph */}
                        <div style={{ position: 'relative', width: '100%', height: 220, overflow: 'hidden' }}>
                            <svg viewBox="0 0 800 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                <defs>
                                    <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={activeTF.isPositive ? '#7c3aed' : '#ef4444'} stopOpacity="0.45" />
                                        <stop offset="100%" stopColor={activeTF.isPositive ? '#ec4899' : '#1a1a24'} stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                {/* Horizontal grid lines */}
                                <line x1="0" y1="40" x2="800" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                                <line x1="0" y1="90" x2="800" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                                <line x1="0" y1="140" x2="800" y2="140" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                                {/* Area fill */}
                                <polygon points={activeTF.fillPoints} fill="url(#stockGradient)" style={{ transition: 'all 0.4s ease' }} />

                                {/* Line path */}
                                <polyline
                                    fill="none"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={activeTF.points}
                                    style={{ stroke: activeTF.isPositive ? '#ec4899' : '#ef4444', transition: 'all 0.4s ease' }}
                                />

                                {/* Glowing Current Price Dot */}
                                <circle cx="800" cy={activeTF.lastY} r="6" fill={activeTF.isPositive ? '#10b981' : '#ef4444'} />
                                <circle cx="800" cy={activeTF.lastY} r="12" fill={activeTF.isPositive ? '#10b981' : '#ef4444'} opacity="0.35">
                                    <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                                </circle>
                            </svg>
                        </div>

                        {/* Stock Chart Footer Info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <div><span>Highest Peak: </span><strong style={{ color: '#fff' }}>{activeTF.peak}</strong></div>
                            <div><span>Lowest Dip: </span><strong style={{ color: '#fff' }}>{activeTF.dip}</strong></div>
                            <div><span>Volume: </span><strong style={{ color: '#fff' }}>{activeTF.volume}</strong></div>
                            <div><span>Active Listed Stock: </span><strong style={{ color: '#fff' }}>{nfts.filter(n => n.status === 'listed').length || 14} Items</strong></div>
                        </div>
                    </div>

                    {/* ===== 2. ALL USERS & POST DETAILS DIRECTORY LIST ===== */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h3 style={{ fontWeight: 800, fontSize: '1.35rem', margin: 0 }}>
                                👥 All Active Creators &amp; Post Details ({creatorList.length})
                            </h3>
                            <span className="text-xs text-muted">
                                Real-time User Accounts &amp; NFT Post Listings
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {creatorList.map((creator, idx) => {
                                const isSelf = (account && account.toLowerCase() === creator.walletAddress.toLowerCase()) ||
                                    (user && (user.walletAddress?.toLowerCase() === creator.walletAddress.toLowerCase() || user.username === creator.username))
                                return (
                                    <div
                                        key={creator.walletAddress + idx}
                                        className="card animate-fade-up"
                                        style={{ padding: '1.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}
                                    >
                                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                            {/* Creator Avatar */}
                                            <div style={{
                                                width: 52, height: 52, borderRadius: '50%',
                                                background: 'var(--gradient-brand)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.25rem', flexShrink: 0, overflow: 'hidden',
                                                border: '2px solid rgba(255,255,255,0.2)'
                                            }}>
                                                {creator.avatar ? (
                                                    <img src={creator.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : '👤'}
                                            </div>

                                            {/* User Details & Wallet Address */}
                                            <div style={{ flex: '1 1 240px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                                                    <h4 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)' }}>
                                                        {creator.username}
                                                    </h4>
                                                    <span className="badge badge-success text-xs">Verified Creator</span>
                                                    <span className="badge badge-info text-xs">{creator.nfts.length} Posts</span>
                                                </div>

                                                {/* Wallet Account Address */}
                                                <div className="text-xs" style={{ fontFamily: 'monospace', color: 'var(--brand-purple-light)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span>Account Address:</span>
                                                    <span style={{ background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                                                        {creator.walletAddress}
                                                    </span>
                                                </div>

                                                {/* Posted NFTs List & Details */}
                                                <div style={{ marginTop: '0.75rem' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                                        Post Listings &amp; NFT Titles:
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        {creator.nfts.map((item) => (
                                                            <Link
                                                                key={item._id || item.id}
                                                                to={`/nft/${item._id || item.id}`}
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.5rem',
                                                                    background: 'var(--bg-card)',
                                                                    border: '1px solid var(--border-color)',
                                                                    borderRadius: 'var(--radius-sm)',
                                                                    padding: '0.35rem 0.75rem',
                                                                    fontSize: '0.8rem',
                                                                    color: '#fff',
                                                                    textDecoration: 'none',
                                                                }}
                                                            >
                                                                <span>🎨</span>
                                                                <span style={{ fontWeight: 600 }}>{item.title}</span>
                                                                <span style={{ color: '#ec4899', fontWeight: 700 }}>({item.price} ETH)</span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Creator Stats & Actions */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', marginLeft: 'auto' }}>
                                                <div className="text-xs text-muted" style={{ textAlign: 'right' }}>
                                                    <div>Total Views: <strong style={{ color: '#fff' }}>{creator.totalViews}</strong></div>
                                                    <div>Total Likes: <strong style={{ color: '#fff' }}>{creator.totalLikes}</strong></div>
                                                    <div>Followers: <strong style={{ color: '#7c3aed' }}>{(creator.followersCount || 0) + (followingMap[creator.walletAddress] ? 1 : 0)}</strong></div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                                    {!isSelf ? (
                                                        <button
                                                            className={`btn btn-sm ${followingMap[creator.walletAddress] ? 'btn-success' : 'btn-primary'}`}
                                                            onClick={() => handleToggleFollow(creator.walletAddress)}
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                                        >
                                                            {followingMap[creator.walletAddress] ? '✓ Following' : '+ Follow'}
                                                        </button>
                                                    ) : (
                                                        <span className="badge badge-info text-xs" style={{ padding: '0.4rem 0.75rem' }}>
                                                            ✨ Your Account
                                                        </span>
                                                    )}
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => navigate('/marketplace')}
                                                    >
                                                        Explore Posts →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section aria-label="Get started" style={{ padding: '5rem 0' }}>
                <div className="container">
                    <div style={{
                        background: 'var(--gradient-brand)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '4rem 3rem',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div aria-hidden="true" style={{
                            position: 'absolute', inset: 0,
                            background: 'radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)',
                        }} />
                        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#fff', marginBottom: '1rem', position: 'relative' }}>
                            Ready to Mint Your First NFT?
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem', position: 'relative', lineHeight: 1.7 }}>
                            Join the revolution of digital ownership. Create, sell, and earn royalties.
                        </p>
                        <div className="flex gap-3 justify-center" style={{ position: 'relative' }}>
                            {isConnected ? (
                                <button className="btn btn-lg" style={{ background: '#fff', color: '#7c3aed', fontWeight: 700 }} onClick={() => navigate('/create')}>
                                    ✨ Create Your NFT
                                </button>
                            ) : (
                                <button
                                    className="btn btn-lg"
                                    style={{ background: '#fff', color: '#7c3aed', fontWeight: 700 }}
                                    onClick={connect}
                                    id="cta-connect-btn"
                                >
                                    🔗 Connect &amp; Get Started
                                </button>
                            )}
                            <button
                                className="btn btn-lg"
                                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
                                onClick={() => navigate('/marketplace')}
                            >
                                Browse NFTs
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

// Animated featured card for hero section
function HeroFeaturedCard() {
    const cards = getDemoNFTs().slice(0, 3)
    const [idx, setIdx] = useState(0)

    useEffect(() => {
        const t = setInterval(() => setIdx(i => (i + 1) % cards.length), 3000)
        return () => clearInterval(t)
    }, [])

    const nft = cards[idx]

    return (
        <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            width: 320,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), var(--shadow-glow)',
            transition: 'all 0.5s ease',
        }}>
            <img
                src={nft.imageUrl}
                alt={nft.title}
                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontWeight: 700, color: '#fff', marginBottom: 4 }}>{nft.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>by {nft.creator?.username || 'Artist'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Current Price</div>
                    <div style={{ fontWeight: 800, color: '#ec4899', fontSize: '1.1rem' }}>{nft.price} ETH</div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: '0.875rem' }}>
                {cards.map((_, i) => (
                    <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i === idx ? 'var(--brand-purple)' : 'rgba(255,255,255,0.2)',
                        transition: 'background 0.3s',
                    }} />
                ))}
            </div>
        </div>
    )
}

export default Home
