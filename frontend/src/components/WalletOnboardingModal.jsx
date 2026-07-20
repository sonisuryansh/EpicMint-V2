import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWeb3 } from '../contexts/Web3Context'
import { authAPI } from '../lib/api'

function WalletOnboardingModal() {
    const { showWalletOnboarding, setShowWalletOnboarding, linkWalletAddress } = useAuth()
    const { connect, web3Service } = useWeb3()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    if (!showWalletOnboarding) return null

    const handleConnectAndLink = async () => {
        setLoading(true)
        setError('')
        setSuccess('')
        try {
            // 1. Connect to MetaMask
            const addr = await connect()

            // 2. Fetch cryptographic nonce challenge from backend
            const nonceRes = await authAPI.getNonce(addr)
            const message = nonceRes.data.message

            // 3. Ask user to sign the message
            const signature = await web3Service.signMessage(message)

            // 4. Send signature to backend to verify ownership & link account
            await linkWalletAddress(addr, signature, message)

            setSuccess('✓ Wallet connected and linked successfully!')
            setTimeout(() => {
                setShowWalletOnboarding(false)
                setSuccess('')
            }, 1500)
        } catch (err) {
            console.error('Wallet onboarding link failed:', err)
            setError(err.response?.data?.message || err.message || 'Failed to connect and verify wallet ownership.')
        } finally {
            setLoading(false)
        }
    }

    const handleSkip = () => {
        setShowWalletOnboarding(false)
        setError('')
        setSuccess('')
    }

    return (
        <div className="modal-overlay" onClick={handleSkip} role="dialog" aria-modal="true" aria-labelledby="onboard-title">
            <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, padding: '2.5rem' }}>
                <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>🦊</div>
                <h3 id="onboard-title" className="text-center mb-3" style={{ fontWeight: 800 }}>
                    Connect Your Wallet
                </h3>
                <p className="text-center text-secondary mb-5" style={{ fontSize: '0.925rem', lineHeight: 1.6 }}>
                    Connect your MetaMask wallet to enable Web3 features such as minting, buying, selling, and trading NFTs.
                </p>

                {error && <div className="alert alert-error mb-4" style={{ fontSize: '0.85rem' }}>⚠️ {error}</div>}
                {success && <div className="alert alert-success mb-4" style={{ fontSize: '0.85rem' }}>{success}</div>}

                <div className="flex flex-col gap-3">
                    <button
                        className="btn btn-primary btn-lg w-full"
                        onClick={handleConnectAndLink}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 14, height: 14 }} />
                                Linking Wallet...
                            </>
                        ) : (
                            '🦊 Connect Wallet'
                        )}
                    </button>
                    <button
                        className="btn btn-ghost w-full"
                        onClick={handleSkip}
                        disabled={loading}
                    >
                        Skip for Now
                    </button>
                </div>
            </div>
        </div>
    )
}

export default WalletOnboardingModal
