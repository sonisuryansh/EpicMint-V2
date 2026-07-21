import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { blogAPI } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { BlogCardSkeleton } from '../components/BlogSkeleton'
import BlogOwnerActions from '../components/BlogOwnerActions'

const BLOG_CATEGORIES = ['All', 'Guides', 'Technology', 'Smart Contracts', 'AI & Tools', 'NFT', 'Security', 'DeFi', 'Community', 'Announcements']

function Blog() {
    const { isAuthenticated } = useAuth()
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [sort, setSort] = useState('latest')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const postsPerPage = 6

    // Debounce search — avoids API call on every keystroke
    const searchTimer = useRef(null)
    const [debouncedSearch, setDebouncedSearch] = useState('')

    useEffect(() => {
        document.title = 'Blog — EpicMint NFT Marketplace'
    }, [])

    useEffect(() => {
        clearTimeout(searchTimer.current)
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchQuery)
            setCurrentPage(1)
        }, 400)
        return () => clearTimeout(searchTimer.current)
    }, [searchQuery])

    const fetchBlogs = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const params = { page: currentPage, limit: postsPerPage, sort }
            if (debouncedSearch) params.search = debouncedSearch
            if (selectedCategory !== 'All') params.category = selectedCategory

            const res = await blogAPI.getAll(params)
            const { blogs: data, pagination } = res.data?.data || {}
            setBlogs(data || [])
            setTotalPages(pagination?.totalPages || 1)
            setTotal(pagination?.total || 0)
        } catch {
            setError('Failed to load blog posts. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [currentPage, debouncedSearch, selectedCategory, sort])

    useEffect(() => { fetchBlogs() }, [fetchBlogs])

    const handleBlogDeleted = useCallback((id) => {
        setBlogs(prev => prev.filter(b => b._id !== id))
        setTotal(prev => Math.max(0, prev - 1))
    }, [])

    return (
        <div style={{ padding: '3rem 0 5rem' }}>
            <div className="container">
                {/* Header */}
                <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 3rem' }}>
                    <div className="section-tag mb-2">📰 Latest Web3 Insights</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }} className="gradient-text">
                        EpicMint Blog &amp; Creator News
                    </h1>
                    <p className="text-secondary" style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                        Discover tutorials, smart contract deep-dives, Pinata IPFS guides, and community announcements.
                    </p>
                    {isAuthenticated && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <Link to="/create-blog" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                ✍️ + Create Blog
                            </Link>
                        </div>
                    )}
                </div>

                {/* Search + Filter + Sort */}
                <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="🔍 Search articles by keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ maxWidth: 350, marginBottom: 0 }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span className="text-xs text-muted">Sort:</span>
                            <button className={`btn btn-sm ${sort === 'latest' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setSort('latest'); setCurrentPage(1) }}>Latest</button>
                            <button className={`btn btn-sm ${sort === 'popular' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setSort('popular'); setCurrentPage(1) }}>Popular</button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {BLOG_CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setSelectedCategory(cat); setCurrentPage(1) }}
                                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                            >{cat}</button>
                        ))}
                    </div>
                </div>

                {/* Result count */}
                {!loading && !error && (
                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="text-sm text-muted">
                            {total === 0 ? 'No articles found' : `${total} article${total !== 1 ? 's' : ''}`}
                        </span>
                        {isAuthenticated && <Link to="/create-blog" className="btn btn-ghost btn-sm">✍️ Write an Article</Link>}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="grid grid-2" style={{ gap: '2rem' }}>
                        {[...Array(6)].map((_, i) => <BlogCardSkeleton key={i} />)}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="alert alert-error" style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
                        <p>{error}</p>
                        <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={fetchBlogs}>Try Again</button>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && blogs.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No articles found</h3>
                        <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
                            Try a different search or category.
                            {isAuthenticated && ' Be the first to write about this topic!'}
                        </p>
                        {isAuthenticated && <Link to="/create-blog" className="btn btn-primary">✍️ Write the first article</Link>}
                    </div>
                )}

                {/* Grid */}
                {!loading && !error && blogs.length > 0 && (
                    <div className="grid grid-2" style={{ gap: '2rem' }}>
                        {blogs.map(post => <BlogCard key={post._id} post={post} onDeleted={handleBlogDeleted} />)}
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                        <button className="btn btn-secondary btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Previous</button>
                        <span className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>Page {currentPage} of {totalPages}</span>
                        <button className="btn btn-secondary btn-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// BlogCard — keeps exact existing visual design.
// Only adds owner Edit/Delete actions for the card owner/admin.
// ─────────────────────────────────────────────────────────────
export function BlogCard({ post, onDeleted }) {
    const authorName = post.authorName || post.author?.name || 'Anonymous'
    const authorAvatar = post.authorAvatar || post.author?.avatar
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=7c3aed&color=fff`
    const authorRole = post.author?.role || ''
    const date = post.createdAt
        ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : post.date || ''

    return (
        <div className="card animate-fade-up" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: 220, objectFit: 'cover' }} loading="lazy" />
            </Link>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className="badge badge-primary">{post.category}</span>
                    <span className="text-xs text-muted">{post.readTime} • {date}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    <Link to={`/blog/${post.slug}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>{post.title}</Link>
                </h3>
                <p className="text-secondary text-sm mb-4" style={{ lineHeight: 1.6, flex: 1 }}>{post.excerpt}</p>

                {/* View + like stats */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                    <span className="text-xs text-muted">👁 {post.views || 0}</span>
                    <span className="text-xs text-muted">❤️ {post.likes || 0}</span>
                </div>

                {/* Author row + owner actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <img src={authorAvatar} alt={authorName} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} loading="lazy" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{authorName}</div>
                        {authorRole && <div className="text-xs text-muted">{authorRole}</div>}
                    </div>
                    <BlogOwnerActions blog={post} onDeleted={onDeleted} variant="card" />
                    <Link to={`/blog/${post.slug}`} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', fontSize: '0.8rem', flexShrink: 0 }}>
                        Read Article →
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Blog
