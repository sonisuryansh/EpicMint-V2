import React, { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { blogAPI } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { BlogCard } from './Blog'
import { BlogDetailSkeleton } from '../components/BlogSkeleton'
import BlogOwnerActions from '../components/BlogOwnerActions'

function BlogDetail() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const { addToast } = useToast()

    const [blog, setBlog] = useState(null)
    const [related, setRelated] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [liking, setLiking] = useState(false)

    const fetchBlog = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await blogAPI.getBySlug(slug)
            const data = res.data?.data?.blog
            setBlog(data)

            // Increment view count — fire and forget
            blogAPI.incrementView(data._id).catch(() => {})

            // Fetch related blogs from same category
            const relRes = await blogAPI.getAll({ category: data.category, limit: 4 })
            setRelated((relRes.data?.data?.blogs || []).filter(b => b.slug !== slug).slice(0, 2))
        } catch (err) {
            setError(err.response?.status === 404 ? 'not_found' : 'error')
        } finally {
            setLoading(false)
        }
    }, [slug])

    useEffect(() => {
        fetchBlog()
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [fetchBlog])

    useEffect(() => {
        document.title = blog ? `${blog.title} — EpicMint Blog` : 'Article Not Found — EpicMint Blog'
    }, [blog])

    const handleLike = async () => {
        if (!isAuthenticated) { addToast('Please log in to like this article.', 'warning'); return }
        if (liking) return
        setLiking(true)
        try {
            const res = await blogAPI.toggleLike(blog._id)
            const { likes, userLiked } = res.data?.data || {}
            setBlog(prev => ({ ...prev, likes, userLiked }))
            addToast(userLiked ? '❤️ Liked!' : 'Like removed.', 'info')
        } catch {
            addToast('Failed to update like.', 'error')
        } finally {
            setLiking(false)
        }
    }

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({ title: blog?.title, url: window.location.href })
        } else {
            await navigator.clipboard.writeText(window.location.href)
            addToast('Link copied to clipboard!', 'success')
        }
    }

    // Markdown renderer — same logic as original BlogDetail
    const renderContent = (content) => {
        if (!content) return null
        return content.split('\n\n').map((para, idx) => {
            if (para.startsWith('# ')) return <h1 key={idx} style={{ color: 'var(--text-primary)', fontWeight: 800, marginTop: '1.5rem', marginBottom: '1rem' }}>{para.replace(/^# /, '')}</h1>
            if (para.startsWith('## ')) return <h2 key={idx} style={{ color: 'var(--text-primary)', fontWeight: 800, marginTop: '1.5rem', marginBottom: '1rem' }}>{para.replace(/^## /, '')}</h2>
            if (para.startsWith('### ')) return <h3 key={idx} style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '1.25rem', marginBottom: '0.75rem' }}>{para.replace(/^### /, '')}</h3>
            if (para.startsWith('```')) return (
                <pre key={idx} style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-sm)', overflowX: 'auto', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    <code>{para.replace(/```\w*\n?/g, '')}</code>
                </pre>
            )
            if (para.startsWith('- ') || para.startsWith('* ')) {
                const items = para.split('\n').filter(l => l.startsWith('- ') || l.startsWith('* '))
                return <ul key={idx} style={{ paddingLeft: '1.5rem', marginBottom: '1.25rem' }}>{items.map((item, i) => <li key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 4 }}>{item.slice(2)}</li>)}</ul>
            }
            if (para.trim()) return <p key={idx} style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>{para}</p>
            return null
        })
    }

    if (loading) return <BlogDetailSkeleton />

    if (error === 'not_found') return (
        <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
            <div className="alert alert-error mb-4" style={{ maxWidth: 500, margin: '0 auto 1.5rem' }}>⚠️ Article not found. It may have been moved or updated.</div>
            <Link to="/blog" className="btn btn-primary">← Return to Blog</Link>
        </div>
    )

    if (error) return (
        <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
            <div className="alert alert-error mb-4" style={{ maxWidth: 500, margin: '0 auto 1.5rem' }}>⚠️ Failed to load article. Please try again.</div>
            <button className="btn btn-primary" onClick={fetchBlog}>Try Again</button>
        </div>
    )

    if (!blog) return null

    const publishDate = blog.createdAt
        ? new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : ''
    const authorName = blog.authorName || 'Anonymous'
    const authorAvatar = blog.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=7c3aed&color=fff`
    const tagList = Array.isArray(blog.tags) ? blog.tags : []

    return (
        <div style={{ padding: '3rem 0 5rem' }}>
            <div className="container" style={{ maxWidth: 900 }}>
                {/* Back */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link to="/blog" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>← Back to Articles</Link>

                    {/* Category + meta */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        <span className="badge badge-primary">{blog.category}</span>
                        <span className="text-xs text-muted">{blog.readTime} • Published on {publishDate}</span>
                        <span className="text-xs text-muted">👁 {blog.views} views</span>
                    </div>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.3 }} className="gradient-text">
                        {blog.title}
                    </h1>

                    {/* Tags */}
                    {tagList.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                            {tagList.map(tag => <span key={tag} className="badge" style={{ fontSize: '0.75rem' }}>#{tag}</span>)}
                        </div>
                    )}

                    {/* Author row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '1rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                        <img src={authorAvatar} alt={authorName} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{authorName}</div>
                            <div className="text-xs text-muted">EpicMint Contributor</div>
                        </div>

                        {/* Like */}
                        <button
                            className="btn btn-sm"
                            onClick={handleLike}
                            disabled={liking}
                            style={{ background: blog.userLiked ? 'linear-gradient(135deg,#ec4899,#be185d)' : 'var(--bg-input)', color: blog.userLiked ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                            {liking ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '❤️'} {blog.likes || 0}
                        </button>

                        {/* Share */}
                        <button className="btn btn-secondary btn-sm" onClick={handleShare}>🔗 Share</button>

                        {/* Owner actions */}
                        <BlogOwnerActions blog={blog} variant="detail" onDeleted={() => navigate('/blog')} />
                    </div>
                </div>

                {/* Cover Image */}
                <img src={blog.coverImage} alt={blog.title} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '2.5rem' }} />

                {/* Content */}
                <div className="card" style={{ padding: '2.5rem', background: 'var(--bg-card)', lineHeight: 1.9, fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
                    {renderContent(blog.content)}
                </div>

                {/* Related */}
                {related.length > 0 && (
                    <div style={{ marginTop: '4rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Read Next</h3>
                        <div className="grid grid-2" style={{ gap: '2rem' }}>
                            {related.map(p => <BlogCard key={p._id} post={p} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BlogDetail
