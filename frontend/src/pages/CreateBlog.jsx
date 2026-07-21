import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { blogAPI, uploadAPI } from '../lib/api'
import { useToast } from '../components/Toast'
import AIBlogModal from '../components/AIBlogModal'

const CATEGORIES = ['Guides', 'Technology', 'Smart Contracts', 'AI & Tools', 'NFT', 'Security', 'DeFi', 'Community', 'Announcements']

function CreateBlog() {
    const { user, isAuthenticated } = useAuth()
    const { addToast } = useToast()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const editId = searchParams.get('edit')
    const isEditing = !!editId

    const [title, setTitle] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [content, setContent] = useState('')
    const [category, setCategory] = useState('Guides')
    const [tags, setTags] = useState('')
    const [coverImage, setCoverImage] = useState('')
    const [metaDescription, setMetaDescription] = useState('')
    const [editSlug, setEditSlug] = useState('')

    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [saving, setSaving] = useState(false)
    const [showAI, setShowAI] = useState(false)
    const [loadingBlog, setLoadingBlog] = useState(isEditing)
    const [tab, setTab] = useState('write')

    useEffect(() => {
        if (!isAuthenticated) navigate('/blog', { replace: true })
    }, [isAuthenticated, navigate])

    useEffect(() => {
        document.title = isEditing ? 'Edit Blog — EpicMint' : 'Create Blog — EpicMint'
    }, [isEditing])

    // Load blog data when editing
    useEffect(() => {
        if (!isEditing || !user) return
        const load = async () => {
            setLoadingBlog(true)
            try {
                // Try fetching author's blogs list to find by id
                const res = await blogAPI.getAll({ author: user._id, limit: 100 })
                let found = (res.data?.data?.blogs || []).find(b => b._id === editId)
                if (!found) {
                    // Might be an admin editing another's blog — fetch all published
                    const res2 = await blogAPI.getAll({ limit: 200 })
                    found = (res2.data?.data?.blogs || []).find(b => b._id === editId)
                }
                if (found) {
                    // Re-fetch full blog to get content field (list omits content)
                    const detailRes = await blogAPI.getBySlug(found.slug)
                    const fullBlog = detailRes.data?.data?.blog
                    if (fullBlog) {
                        setTitle(fullBlog.title || '')
                        setExcerpt(fullBlog.excerpt || '')
                        setContent(fullBlog.content || '')
                        setCategory(fullBlog.category || 'Guides')
                        setTags(Array.isArray(fullBlog.tags) ? fullBlog.tags.join(', ') : '')
                        setCoverImage(fullBlog.coverImage || '')
                        setMetaDescription(fullBlog.metaDescription || '')
                        setEditSlug(fullBlog.slug || '')
                    }
                } else {
                    addToast('Blog not found or no permission to edit.', 'error')
                    navigate('/blog')
                }
            } catch {
                addToast('Failed to load blog.', 'error')
                navigate('/blog')
            } finally {
                setLoadingBlog(false)
            }
        }
        load()
    }, [editId, isEditing, user])

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        setUploadProgress(0)
        try {
            const res = await uploadAPI.uploadImage(file, p => setUploadProgress(p))
            setCoverImage(res.data?.data?.gatewayUrl || res.data?.data?.url || '')
            addToast('Cover image uploaded!', 'success')
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Image upload failed. Please try again.'
            addToast(`Image upload failed: ${msg}`, 'error')
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }

    const handleAIApply = useCallback((g) => {
        if (g.title) setTitle(g.title.slice(0, 200))
        if (g.excerpt) setExcerpt(g.excerpt.slice(0, 500))
        if (g.content) setContent(g.content)
        if (g.tags) setTags(Array.isArray(g.tags) ? g.tags.join(', ') : g.tags)
        if (g.metaDescription) setMetaDescription(g.metaDescription.trim().slice(0, 160))
    }, [])

    const handleSubmit = async (status) => {
        if (!title.trim()) { addToast('Title is required.', 'warning'); return }
        if (!excerpt.trim()) { addToast('Excerpt is required.', 'warning'); return }
        if (!content.trim()) { addToast('Content is required.', 'warning'); return }
        if (!coverImage) { addToast('Cover image is required.', 'warning'); return }

        setSaving(true)
        const payload = {
            title: title.trim().slice(0, 200),
            excerpt: excerpt.trim().slice(0, 500),
            content,
            coverImage,
            category,
            tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
            status,
            metaDescription: (metaDescription || excerpt).trim().slice(0, 160),
        }

        try {
            if (isEditing) {
                await blogAPI.update(editId, payload)
                addToast(status === 'published' ? 'Blog published!' : 'Draft saved!', 'success')
                if (status === 'published' && editSlug) navigate(`/blog/${editSlug}`)
                else navigate('/blog')
            } else {
                const res = await blogAPI.create(payload)
                const slug = res.data?.data?.blog?.slug
                addToast(status === 'published' ? 'Blog published!' : 'Draft saved!', 'success')
                if (status === 'published' && slug) navigate(`/blog/${slug}`)
                else navigate('/blog')
            }
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to save blog.', 'error')
        } finally {
            setSaving(false)
        }
    }

    const renderPreview = () => {
        if (!content.trim()) return <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Write some content to see preview.</p>
        return content.split('\n\n').map((para, i) => {
            if (para.startsWith('# ')) return <h1 key={i} style={{ color: 'var(--text-primary)', fontWeight: 800, margin: '1.5rem 0 1rem' }}>{para.replace(/^# /, '')}</h1>
            if (para.startsWith('## ')) return <h2 key={i} style={{ color: 'var(--text-primary)', fontWeight: 800, margin: '1.5rem 0 1rem' }}>{para.replace(/^## /, '')}</h2>
            if (para.startsWith('### ')) return <h3 key={i} style={{ color: 'var(--text-primary)', fontWeight: 700, margin: '1.25rem 0 0.75rem' }}>{para.replace(/^### /, '')}</h3>
            if (para.startsWith('```')) return <pre key={i} style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-sm)', overflowX: 'auto', fontSize: '0.875rem', marginBottom: '1rem' }}><code>{para.replace(/```\w*\n?/g, '')}</code></pre>
            if (para.startsWith('- ') || para.startsWith('* ')) {
                const items = para.split('\n').filter(l => l.startsWith('- ') || l.startsWith('* '))
                return <ul key={i} style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>{items.map((item, j) => <li key={j} style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 4 }}>{item.slice(2)}</li>)}</ul>
            }
            if (para.trim()) return <p key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.9, marginBottom: '1.25rem' }}>{para}</p>
            return null
        })
    }

    if (!isAuthenticated) return null
    if (loadingBlog) return (
        <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
            <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 1rem' }} />
            <p className="text-muted">Loading blog...</p>
        </div>
    )

    return (
        <div style={{ padding: '3rem 0 6rem' }}>
            <div className="container" style={{ maxWidth: 900 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <Link to="/blog" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}>← Back to Blog</Link>
                        <div className="section-tag mb-2">{isEditing ? '✏️ Edit Blog' : '✍️ Write New Blog'}</div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900 }} className="gradient-text">
                            {isEditing ? 'Edit Blog Post' : 'Create Blog Post'}
                        </h1>
                    </div>
                    <button className="btn btn-ghost" onClick={() => setShowAI(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)' }}>
                        ✨ Generate with AI
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Cover Image */}
                    <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
                        <label className="form-label">Cover Image *</label>
                        {coverImage ? (
                            <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                <img src={coverImage} alt="Cover" style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                                <button onClick={() => setCoverImage('')} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                            </div>
                        ) : (
                            <div
                                style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '3rem 1rem', textAlign: 'center', marginBottom: '1rem', background: 'var(--bg-input)', cursor: 'pointer' }}
                                onClick={() => document.getElementById('blog-img-input').click()}
                            >
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🖼️</div>
                                <p className="text-secondary text-sm">
                                    {uploading ? `Uploading... ${uploadProgress}%` : 'Click to upload cover image (JPG, PNG, WebP — max 20MB)'}
                                </p>
                                {uploading && (
                                    <div style={{ background: 'var(--border-color)', borderRadius: 999, height: 6, marginTop: '1rem', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--color-primary)', transition: 'width 0.2s' }} />
                                    </div>
                                )}
                            </div>
                        )}
                        <input id="blog-img-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => document.getElementById('blog-img-input').click()} disabled={uploading}>
                                {uploading ? 'Uploading...' : coverImage ? 'Change Image' : 'Upload Image'}
                            </button>
                            <span className="text-xs text-muted">or paste URL:</span>
                            <input className="form-control" style={{ marginBottom: 0, flex: 1, minWidth: 200 }} placeholder="https://..." value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
                        <label className="form-label">Title * <span className="text-muted text-xs">({title.length}/200)</span></label>
                        <input className="form-control" style={{ fontSize: '1.1rem', fontWeight: 700 }} placeholder="Write a compelling title..." value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    {/* Category + Tags */}
                    <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
                            <div>
                                <label className="form-label">Category *</label>
                                <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Tags <span className="text-muted text-xs">(comma separated, max 10)</span></label>
                                <input className="form-control" placeholder="nft, ethereum, solidity..." value={tags} onChange={(e) => setTags(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
                        <label className="form-label">Excerpt * <span className="text-muted text-xs">({excerpt.length}/500) — shown on blog cards</span></label>
                        <textarea className="form-control" rows={3} placeholder="A short, engaging summary..." value={excerpt} maxLength={500} onChange={(e) => setExcerpt(e.target.value)} />
                    </div>

                    {/* Content with Write/Preview tabs */}
                    <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Content * <span className="text-muted text-xs">(Markdown supported)</span></label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className={`btn btn-sm ${tab === 'write' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('write')}>✏️ Write</button>
                                <button className={`btn btn-sm ${tab === 'preview' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('preview')}>👁 Preview</button>
                            </div>
                        </div>
                        {tab === 'write' ? (
                            <textarea
                                className="form-control"
                                rows={20}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={`# Blog Title\n\n## Introduction\n\nStart writing here. Markdown supported:\n\n## Heading\n\nParagraph text.\n\n- Bullet point 1\n- Bullet point 2\n\n\`\`\`solidity\ncontract Example {}\n\`\`\``}
                                style={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 1.7, resize: 'vertical' }}
                            />
                        ) : (
                            <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-input)', minHeight: 400, lineHeight: 1.9, fontSize: '1rem' }}>
                                {renderPreview()}
                            </div>
                        )}
                    </div>

                    {/* Meta Description */}
                    <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)' }}>
                        <label className="form-label">Meta Description <span className="text-muted text-xs">({metaDescription.length}/160)</span></label>
                        <textarea className="form-control" rows={2} placeholder="SEO description (auto-filled from excerpt if left empty)..." value={metaDescription} maxLength={160} onChange={(e) => setMetaDescription(e.target.value)} />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Link to="/blog" className="btn btn-secondary">Cancel</Link>
                        <button className="btn btn-secondary" onClick={() => handleSubmit('draft')} disabled={saving || uploading}>
                            {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '💾'} Save Draft
                        </button>
                        <button className="btn btn-primary" onClick={() => handleSubmit('published')} disabled={saving || uploading}>
                            {saving
                                ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="spinner" style={{ width: 14, height: 14 }} />Publishing...</span>
                                : '🚀 Publish'}
                        </button>
                    </div>
                </div>
            </div>

            <AIBlogModal isOpen={showAI} onClose={() => setShowAI(false)} onApply={handleAIApply} />
        </div>
    )
}

export default CreateBlog
