import React, { useState, useEffect } from 'react'
import { blogAIAPI } from '../lib/api'
import { useToast } from './Toast'

const TONES = ['Professional', 'Educational', 'Conversational', 'Technical', 'Inspiring']
const AUDIENCES = ['Web3 developers and NFT enthusiasts', 'Beginner crypto investors', 'Solidity developers', 'NFT collectors and artists', 'General blockchain audience']
const LENGTHS = ['Short (300-500 words)', 'Medium (600-900 words)', 'Long (1000-1500 words)']

/**
 * AIBlogModal
 * Props: isOpen, onClose, onApply(generatedData)
 */
function AIBlogModal({ isOpen, onClose, onApply }) {
    const { addToast } = useToast()
    const [topic, setTopic] = useState('')
    const [keywords, setKeywords] = useState('')
    const [tone, setTone] = useState('Professional')
    const [audience, setAudience] = useState(AUDIENCES[0])
    const [length, setLength] = useState('Medium (600-900 words)')
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState(null)

    useEffect(() => {
        if (!isOpen) { setTopic(''); setKeywords(''); setPreview(null); setLoading(false) }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        const fn = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', fn)
        return () => window.removeEventListener('keydown', fn)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const handleGenerate = async () => {
        if (!topic.trim()) { addToast('Please enter a topic.', 'warning'); return }
        setLoading(true)
        setPreview(null)
        try {
            const res = await blogAIAPI.generate({ topic: topic.trim(), keywords, tone, audience, length })
            setPreview(res.data.data)
            addToast('✨ Blog draft generated! Review and apply.', 'success')
        } catch (err) {
            addToast(err.response?.data?.message || 'AI generation failed. Try again.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem', overflowY: 'auto' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="card animate-fade-up" style={{ maxWidth: 680, width: '100%', background: 'var(--bg-card)', padding: '2rem', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>

                <div style={{ marginBottom: '1.75rem' }}>
                    <div className="section-tag mb-2">✨ AI Blog Generator</div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }} className="gradient-text">Generate with Gemini AI</h2>
                    <p className="text-secondary text-sm" style={{ marginTop: '0.4rem' }}>Describe your topic and Gemini writes a full Web3 blog draft.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label className="form-label">Topic *</label>
                        <input className="form-control" placeholder="e.g. How to optimize gas fees on Ethereum" value={topic} onChange={(e) => setTopic(e.target.value)} disabled={loading} />
                    </div>
                    <div>
                        <label className="form-label">Keywords (comma separated)</label>
                        <input className="form-control" placeholder="e.g. NFT, Solidity, ERC-721, OpenZeppelin" value={keywords} onChange={(e) => setKeywords(e.target.value)} disabled={loading} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="form-label">Tone</label>
                            <select className="form-control" value={tone} onChange={(e) => setTone(e.target.value)} disabled={loading}>
                                {TONES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Length</label>
                            <select className="form-control" value={length} onChange={(e) => setLength(e.target.value)} disabled={loading}>
                                {LENGTHS.map(l => <option key={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Target Audience</label>
                        <select className="form-control" value={audience} onChange={(e) => setAudience(e.target.value)} disabled={loading}>
                            {AUDIENCES.map(a => <option key={a}>{a}</option>)}
                        </select>
                    </div>
                    <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || !topic.trim()} style={{ width: '100%' }}>
                        {loading
                            ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span className="spinner" style={{ width: 16, height: 16 }} />Generating...</span>
                            : '✨ Generate Blog'}
                    </button>
                </div>

                {preview && (
                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ fontWeight: 700 }}>Preview</h4>
                            <span className="badge badge-primary">{preview.readTime}</span>
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{preview.title}</h3>
                        <p className="text-secondary text-sm" style={{ marginBottom: '1rem' }}>{preview.excerpt}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                            {preview.tags?.map(tag => <span key={tag} className="badge" style={{ fontSize: '0.75rem' }}>#{tag}</span>)}
                        </div>
                        <div style={{ maxHeight: 200, overflowY: 'auto', background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                            {preview.content?.slice(0, 600)}...
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} onClick={() => { onApply(preview); onClose(); addToast('AI content applied!', 'success') }}>
                            ✅ Apply to Form
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AIBlogModal
