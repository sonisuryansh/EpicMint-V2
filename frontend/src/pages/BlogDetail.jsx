import React, { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { BLOG_POSTS } from '../lib/demoBlogData'
import { BlogCard } from './Blog'

function BlogDetail() {
    const { slug } = useParams()
    const navigate = useNavigate()

    const post = BLOG_POSTS.find(p => p.slug === slug)

    useEffect(() => {
        if (post) {
            document.title = `${post.title} — EpicMint Blog`
        } else {
            document.title = 'Article Not Found — EpicMint Blog'
        }
    }, [post])

    if (!post) {
        return (
            <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
                <div className="alert alert-error mb-4" style={{ maxWidth: 500, margin: '0 auto 1.5rem' }}>
                    ⚠️ Article not found. It may have been moved or updated.
                </div>
                <Link to="/blog" className="btn btn-primary">← Return to Blog</Link>
            </div>
        )
    }

    const relatedPosts = BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 2)

    return (
        <div style={{ padding: '3rem 0 5rem' }}>
            <div className="container" style={{ maxWidth: 900 }}>
                {/* Breadcrumb & Return */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link to="/blog" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
                        ← Back to Articles
                    </Link>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span className="badge badge-primary">{post.category}</span>
                        <span className="text-xs text-muted">{post.readTime} • Published on {post.date}</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.3 }} className="gradient-text">
                        {post.title}
                    </h1>

                    {/* Author Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                        <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{post.author.name}</div>
                            <div className="text-xs text-muted">{post.author.role}</div>
                        </div>
                    </div>
                </div>

                {/* Cover Image */}
                <img
                    src={post.coverImage}
                    alt={post.title}
                    style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '2.5rem' }}
                />

                {/* Main Article Content */}
                <div className="card" style={{ padding: '2.5rem', background: 'var(--bg-card)', lineHeight: 1.9, fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
                    {post.content.split('\n\n').map((paragraph, idx) => {
                        if (paragraph.startsWith('# ')) {
                            return <h1 key={idx} style={{ color: 'var(--text-primary)', fontWeight: 800, marginTop: '1.5rem', marginBottom: '1rem' }}>{paragraph.replace('# ', '')}</h1>
                        }
                        if (paragraph.startsWith('## ')) {
                            return <h2 key={idx} style={{ color: 'var(--text-primary)', fontWeight: 800, marginTop: '1.5rem', marginBottom: '1rem' }}>{paragraph.replace('## ', '')}</h2>
                        }
                        if (paragraph.startsWith('### ')) {
                            return <h3 key={idx} style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '1.25rem', marginBottom: '0.75rem' }}>{paragraph.replace('### ', '')}</h3>
                        }
                        if (paragraph.startsWith('```')) {
                            return (
                                <pre key={idx} style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-sm)', overflowX: 'auto', fontSize: '0.875rem' }}>
                                    <code>{paragraph.replace(/```/g, '')}</code>
                                </pre>
                            )
                        }
                        return <p key={idx} style={{ marginBottom: '1.25rem' }}>{paragraph}</p>
                    })}
                </div>

                {/* Related Articles */}
                <div style={{ marginTop: '4rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Read Next</h3>
                    <div className="grid grid-2" style={{ gap: '2rem' }}>
                        {relatedPosts.map(p => (
                            <BlogCard key={p.id} post={p} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BlogDetail
