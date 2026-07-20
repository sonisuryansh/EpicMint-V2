import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BLOG_POSTS, BLOG_CATEGORIES } from '../lib/demoBlogData'

function Blog() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [currentPage, setCurrentPage] = useState(1)
    const postsPerPage = 6

    useEffect(() => {
        document.title = 'Blog — EpicMint NFT Marketplace'
    }, [])

    const filteredPosts = BLOG_POSTS.filter(post => {
        const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const indexOfLastPost = currentPage * postsPerPage
    const indexOfFirstPost = indexOfLastPost - postsPerPage
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost)
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage)

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
                </div>

                {/* Search & Category Filter */}
                <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="🔍 Search articles by keyword..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                            style={{ maxWidth: 350, marginBottom: 0 }}
                        />

                        {/* Categories */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {BLOG_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => { setSelectedCategory(cat); setCurrentPage(1) }}
                                    className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Articles Grid */}
                {currentPosts.length === 0 ? (
                    <div className="alert alert-warning" style={{ textAlign: 'center', padding: '3rem' }}>
                        🔍 No blog articles found matching your criteria. Try adjusting your search query!
                    </div>
                ) : (
                    <div className="grid grid-2" style={{ gap: '2rem' }}>
                        {currentPosts.map(post => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                        <button
                            className="btn btn-secondary btn-sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            ← Previous
                        </button>
                        <span className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="btn btn-secondary btn-sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// Reusable BlogCard Component
export function BlogCard({ post }) {
    return (
        <div className="card animate-fade-up" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <img
                    src={post.coverImage}
                    alt={post.title}
                    style={{ width: '100%', height: 220, objectFit: 'cover' }}
                />
            </Link>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className="badge badge-primary">{post.category}</span>
                    <span className="text-xs text-muted">{post.readTime} • {post.date}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    <Link to={`/blog/${post.slug}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {post.title}
                    </Link>
                </h3>
                <p className="text-secondary text-sm mb-4" style={{ lineHeight: 1.6, flex: 1 }}>
                    {post.excerpt}
                </p>

                {/* Author Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{post.author.name}</div>
                        <div className="text-xs text-muted">{post.author.role}</div>
                    </div>
                    <Link to={`/blog/${post.slug}`} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>
                        Read Article →
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Blog
