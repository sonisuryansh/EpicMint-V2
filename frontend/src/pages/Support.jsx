import React, { useState, useEffect } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { supportAPI } from '../lib/api'

function Support() {
    const { account } = useWeb3()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [walletAddress, setWalletAddress] = useState('')
    const [subject, setSubject] = useState('')
    const [category, setCategory] = useState('General Question')
    const [message, setMessage] = useState('')
    const [attachment, setAttachment] = useState(null)

    const [submitting, setSubmitting] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        document.title = 'Support & Help Desk — EpicMint'
        if (account) {
            setWalletAddress(account)
        }
    }, [account])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setSuccessMsg('')
        setErrorMsg('')

        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('email', email)
            formData.append('walletAddress', walletAddress)
            formData.append('subject', subject)
            formData.append('category', category)
            formData.append('message', message)
            if (attachment) {
                formData.append('attachment', attachment)
            }

            const res = await supportAPI.submit(formData)
            setSuccessMsg(res.data.message || 'Ticket submitted successfully!')

            // Reset form
            setName('')
            setEmail('')
            setSubject('')
            setMessage('')
            setAttachment(null)
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to submit ticket. Please check your connection.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div style={{ padding: '3rem 0 5rem' }}>
            <div className="container" style={{ maxWidth: 760 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div className="section-tag mb-2">💬 Customer Desk</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }} className="gradient-text">
                        EpicMint Support Center
                    </h1>
                    <p className="text-secondary" style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                        Have questions about minting, wallet issues, or marketplace transactions? Send a ticket to our team.
                    </p>
                </div>

                {/* Alerts */}
                {successMsg && (
                    <div className="alert alert-success mb-4" style={{ padding: '1.25rem' }}>
                        🎉 {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="alert alert-error mb-4" style={{ padding: '1.25rem' }}>
                        ⚠️ {errorMsg}
                    </div>
                )}

                {/* Support Form */}
                <div className="card" style={{ padding: '2.5rem', background: 'var(--bg-card)' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
                            <div className="form-group mb-0">
                                <label className="form-label">Your Full Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group mb-0">
                                <label className="form-label">Email Address *</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
                            <div className="form-group mb-0">
                                <label className="form-label">Wallet Address (Optional)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="0x..."
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                />
                            </div>

                            <div className="form-group mb-0">
                                <label className="form-label">Category *</label>
                                <select
                                    className="form-control"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="General Question">General Question</option>
                                    <option value="Minting &amp; IPFS">Minting &amp; IPFS</option>
                                    <option value="Wallet &amp; Web3">Wallet &amp; Web3</option>
                                    <option value="Marketplace &amp; Payments">Marketplace &amp; Payments</option>
                                    <option value="Bug Report">Bug Report</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group mb-3">
                            <label className="form-label">Subject *</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Issue with transaction hash or IPFS pin"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group mb-4">
                            <label className="form-label">Detailed Message *</label>
                            <textarea
                                className="form-control"
                                rows={5}
                                placeholder="Provide as much detail as possible..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group mb-4">
                            <label className="form-label">File Attachment (Screenshot/Log - Max 5MB)</label>
                            <input
                                type="file"
                                className="form-control"
                                onChange={(e) => setAttachment(e.target.files[0])}
                                accept="image/*,.pdf,.txt"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting Ticket...' : '📩 Submit Support Ticket'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Support
