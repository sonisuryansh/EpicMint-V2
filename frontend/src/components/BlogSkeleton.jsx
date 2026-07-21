import React from 'react'

/** Skeleton matching BlogCard shape exactly */
export function BlogCardSkeleton() {
    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            <div className="skeleton" style={{ width: '100%', height: 220 }} />
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 999 }} />
                    <div className="skeleton" style={{ width: 110, height: 14 }} />
                </div>
                <div className="skeleton" style={{ width: '90%', height: 20 }} />
                <div className="skeleton" style={{ width: '70%', height: 20 }} />
                <div className="skeleton" style={{ width: '100%', height: 14 }} />
                <div className="skeleton" style={{ width: '85%', height: 14 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ width: 100, height: 14, marginBottom: 4 }} />
                        <div className="skeleton" style={{ width: 70, height: 11 }} />
                    </div>
                    <div className="skeleton" style={{ width: 90, height: 30, borderRadius: 'var(--radius-sm)' }} />
                </div>
            </div>
        </div>
    )
}

/** Skeleton matching BlogDetail layout */
export function BlogDetailSkeleton() {
    return (
        <div style={{ padding: '3rem 0 5rem' }}>
            <div className="container" style={{ maxWidth: 900 }}>
                <div className="skeleton" style={{ width: 140, height: 36, borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }} />
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 999 }} />
                    <div className="skeleton" style={{ width: 160, height: 16 }} />
                </div>
                <div className="skeleton" style={{ width: '80%', height: 48, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '55%', height: 48, marginBottom: '1.5rem' }} />
                <div style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', marginBottom: '2.5rem' }}>
                    <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
                    <div>
                        <div className="skeleton" style={{ width: 120, height: 16, marginBottom: 4 }} />
                        <div className="skeleton" style={{ width: 80, height: 12 }} />
                    </div>
                </div>
                <div className="skeleton" style={{ width: '100%', height: 420, borderRadius: 'var(--radius-lg)', marginBottom: '2.5rem' }} />
                {[100, 90, 100, 75, 90, 60].map((w, i) => (
                    <div key={i} className="skeleton" style={{ width: `${w}%`, height: 16, marginBottom: '0.75rem' }} />
                ))}
            </div>
        </div>
    )
}

export default BlogCardSkeleton
