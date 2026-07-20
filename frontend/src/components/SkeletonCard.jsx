import React from 'react'

export function SkeletonCard() {
    return (
        <div className="card overflow-hidden" style={{ padding: 0, height: 380, background: 'var(--bg-card)' }}>
            <div className="skeleton" style={{ width: '100%', height: 220 }} />
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: 160 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                    <div className="skeleton" style={{ width: 120, height: 14 }} />
                </div>
                <div className="skeleton" style={{ width: '80%', height: 18 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div className="skeleton" style={{ width: 60, height: 14 }} />
                    <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 12 }} />
                </div>
            </div>
        </div>
    )
}

export function SkeletonGrid({ count = 6 }) {
    return (
        <div className="nft-grid">
            {Array.from({ length: count }).map((_, idx) => (
                <SkeletonCard key={idx} />
            ))}
        </div>
    )
}

export default SkeletonCard
