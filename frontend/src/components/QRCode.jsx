import React, { useState } from 'react'

/**
 * QRCode component.
 * Generates QR code using multi-provider fallback (QuickChart -> QRServer -> Google Charts).
 * Guarantees rendering even if one provider or ad-blocker blocks an API.
 */
export function QRCode({ value, size = 100, style = {} }) {
    const [providerIndex, setProviderIndex] = useState(0)

    const encoded = encodeURIComponent(value || (typeof window !== 'undefined' ? window.location.href : ''))

    const providers = [
        `https://quickchart.io/qr?text=${encoded}&size=${size}&margin=1`,
        `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`,
        `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encoded}`,
    ]

    const handleImgError = () => {
        if (providerIndex < providers.length - 1) {
            setProviderIndex(prev => prev + 1)
        }
    }

    return (
        <div style={{ position: 'relative', width: size, height: size, ...style }}>
            <img
                src={providers[providerIndex]}
                alt="NFT QR Code"
                onError={handleImgError}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    border: '4px solid white',
                    borderRadius: 'var(--radius-sm)',
                    background: 'white',
                    display: 'block',
                }}
            />
        </div>
    )
}

export default QRCode
