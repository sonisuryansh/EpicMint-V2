import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { nftAPI } from '../lib/api'
import NFTCard from '../components/NFTCard'
import { getDemoNFTs } from '../lib/demoData'
import SEO from '../components/SEO'

const CATEGORIES = ['all', 'art', 'gaming', 'collectibles', 'music', 'photography', 'sports', 'utility']
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'popular', label: 'Most Viewed' },
]

function Marketplace() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [nfts, setNfts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, hasNext: false, hasPrev: false })

    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const creatorAddress = searchParams.get('creatorAddress') || searchParams.get('creator') || ''

    const [searchInput, setSearchInput] = useState(search)

    useEffect(() => {
        document.title = 'Marketplace — EpicMint'
    }, [])

    const fetchNFTs = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const params = { page, limit: 12, sort }
            if (category && category !== 'all') params.category = category
            if (search) params.search = search
            if (creatorAddress) params.creatorAddress = creatorAddress

            const res = await nftAPI.getAll(params)
            setNfts(res.data.data || [])
            setPagination(res.data.pagination || {})
        } catch (err) {
            setError('Could not connect to backend — showing demo data')
            // Filter and sort demo data
            let demo = getDemoNFTs()
            if (category !== 'all') demo = demo.filter(n => n.category === category)
            if (search) demo = demo.filter(n => n.title.toLowerCase().includes(search.toLowerCase()))
            if (creatorAddress) demo = demo.filter(n => (n.creatorAddress || '').toLowerCase() === creatorAddress.toLowerCase())
            setNfts(demo)
            setPagination({ total: demo.length, page: 1, pages: 1 })
        } finally {
            setLoading(false)
        }
    }, [page, sort, category, search, creatorAddress])

    useEffect(() => {
        fetchNFTs()
    }, [fetchNFTs])

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams)
        if (value && value !== 'all') {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        params.delete('page') // Reset to page 1 on filter change
        setSearchParams(params)
    }

    const handleSearch = (e) => {
        e.preventDefault()
        updateParam('search', searchInput)
    }

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', newPage.toString())
        setSearchParams(params)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div style={{ padding: '2.5rem 0 4rem' }}>
            <SEO title="NFT Marketplace" description="Discover, buy, and trade rare digital art and Web3 collectibles on Ethereum Sepolia Testnet." />
            <div className="container">
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div className="section-tag" style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>🏪 Browse &amp; Collect</div>
                    <h1 className="display-section">NFT Marketplace</h1>
                    {pagination.total > 0 && (
                        <p className="text-secondary text-sm" style={{ marginTop: '0.25rem' }}>
                            {pagination.total} NFTs available
                        </p>
                    )}
                </div>

                {/* Active Creator Filter Indicator */}
                {creatorAddress && (
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-info" style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🎨 Creator Filter: <strong>{creatorAddress}</strong></span>
                            <button
                                type="button"
                                onClick={() => updateParam('creatorAddress', '')}
                                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold', marginLeft: '0.25rem' }}
                            >
                                ✕ Clear Filter
                            </button>
                        </span>
                    </div>
                )}

                {/* Filter Bar */}
                <div className="filter-bar">
                    {/* Search */}
                    <form className="filter-search" onSubmit={handleSearch}>
                        <span className="filter-search-icon">🔍</span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search NFTs..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            aria-label="Search NFTs"
                            id="marketplace-search"
                        />
                    </form>

                    {/* Category */}
                    <select
                        className="form-select"
                        style={{ width: 'auto', minWidth: 140 }}
                        value={category}
                        onChange={e => updateParam('category', e.target.value)}
                        aria-label="Filter by category"
                        id="marketplace-category"
                    >
                        {CATEGORIES.map(c => (
                            <option key={c} value={c}>
                                {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
                            </option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        className="form-select"
                        style={{ width: 'auto', minWidth: 160 }}
                        value={sort}
                        onChange={e => updateParam('sort', e.target.value)}
                        aria-label="Sort NFTs"
                        id="marketplace-sort"
                    >
                        {SORT_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>

                    {/* Active filters */}
                    {(search || category !== 'all') && (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                                setSearchInput('')
                                setSearchParams({})
                            }}
                        >
                            ✕ Clear Filters
                        </button>
                    )}
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>⚠️ {error}</div>
                )}

                {/* NFT Grid */}
                {!loading && nfts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🎭</div>
                        <div className="empty-state-title">No NFTs found</div>
                        <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
                            Try a different search term or category
                        </p>
                        <button
                            className="btn btn-secondary"
                            style={{ marginTop: '1.5rem' }}
                            onClick={() => { setSearchInput(''); setSearchParams({}) }}
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="nft-grid">
                        {loading
                            ? Array.from({ length: 12 }).map((_, i) => <NFTCard key={i} loading />)
                            : nfts.map(nft => <NFTCard key={nft._id || nft.id} nft={nft} />)
                        }
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="pagination">
                        <button
                            className="page-btn"
                            disabled={!pagination.hasPrev}
                            onClick={() => handlePageChange(page - 1)}
                            aria-label="Previous page"
                        >
                            ←
                        </button>

                        {Array.from({ length: Math.min(pagination.pages, 7) }).map((_, i) => {
                            const p = i + 1
                            return (
                                <button
                                    key={p}
                                    className={`page-btn ${p === page ? 'active' : ''}`}
                                    onClick={() => handlePageChange(p)}
                                    aria-label={`Page ${p}`}
                                    aria-current={p === page ? 'page' : undefined}
                                >
                                    {p}
                                </button>
                            )
                        })}

                        <button
                            className="page-btn"
                            disabled={!pagination.hasNext}
                            onClick={() => handlePageChange(page + 1)}
                            aria-label="Next page"
                        >
                            →
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Marketplace
