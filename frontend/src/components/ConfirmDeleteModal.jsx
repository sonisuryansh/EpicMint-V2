import React, { useEffect } from 'react'

/**
 * ConfirmDeleteModal
 * Props: isOpen, onClose, onConfirm, isDeleting, title
 */
function ConfirmDeleteModal({ isOpen, onClose, onConfirm, isDeleting, title }) {
    useEffect(() => {
        if (!isOpen) return
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="card animate-fade-up" style={{ maxWidth: 440, width: '100%', padding: '2rem', background: 'var(--bg-card)', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗑️</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Delete Blog?</h3>
                {title && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontStyle: 'italic' }}>"{title}"</p>
                )}
                <p className="text-secondary" style={{ marginBottom: '2rem', lineHeight: 1.6 }}>
                    This action <strong>cannot be undone</strong>. The blog post will be permanently removed.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={onClose} disabled={isDeleting}>Cancel</button>
                    <button
                        className="btn btn-primary"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', minWidth: 100 }}
                    >
                        {isDeleting
                            ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="spinner" style={{ width: 14, height: 14 }} />Deleting...</span>
                            : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDeleteModal
