import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWeb3 } from '../contexts/Web3Context'
import { uploadAPI, nftAPI, aiAPI } from '../lib/api'
import SEO from '../components/SEO'

const CATEGORIES = ['art', 'gaming', 'collectibles', 'music', 'photography', 'sports', 'utility']

const STEP_LABELS = ['Upload', 'Details', 'Mint']

function Create() {
    const navigate = useNavigate()
    const { isConnected, account, connect, web3Service } = useWeb3()
    const fileInputRef = useRef(null)

    const [step, setStep] = useState(0)
    const [dragOver, setDragOver] = useState(false)
    const [preview, setPreview] = useState(null)
    const [file, setFile] = useState(null)

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'art',
        price: '',
        royalty: '250',
        tags: '',
    })

    const [attributes, setAttributes] = useState([])
    const [aiPrompt, setAiPrompt] = useState('')
    const [initialAiTitle, setInitialAiTitle] = useState('')
    const [initialAiDesc, setInitialAiDesc] = useState('')
    const [activeTab, setActiveTab] = useState('copilot') // 'copilot' | 'manual'
    const [collectionSuggestion, setCollectionSuggestion] = useState('')
    const [summarySuggestion, setSummarySuggestion] = useState('')
    const [aiLoading, setAiLoading] = useState(false)
    const [aiSuccess, setAiSuccess] = useState(false)
    const [aiError, setAiError] = useState('')

    const [uploadProgress, setUploadProgress] = useState(0)
    const [status, setStatus] = useState('idle') // idle | uploading | minting | success | error
    const [error, setError] = useState('')
    const [txSteps, setTxSteps] = useState([
        { label: 'Uploading image to IPFS', state: 'pending' },
        { label: 'Uploading metadata to IPFS', state: 'pending' },
        { label: 'Minting on blockchain', state: 'pending' },
        { label: 'Saving to database', state: 'pending' },
    ])
    const [mintResult, setMintResult] = useState(null)

    // SEO
    React.useEffect(() => {
        document.title = 'Create NFT — EpicMint'
    }, [])

    const updateTxStep = (index, state) => {
        setTxSteps(prev => prev.map((s, i) => i === index ? { ...s, state } : s))
    }

    const handleAIGeneration = async () => {
        if (!aiPrompt) return
        setAiLoading(true)
        setAiSuccess(false)
        setAiError('')
        try {
            const res = await aiAPI.generateMetadata(null, null, aiPrompt)
            const meta = res.data?.metadata || {}

            setForm(prev => ({
                ...prev,
                title: meta.title || aiPrompt || 'AI Generated NFT',
                description: meta.description || aiPrompt || '',
                category: meta.category || prev.category || 'art',
                tags: Array.isArray(meta.tags) ? meta.tags.join(', ') : 'nft, art, collectible',
                royalty: getRoyaltyBasisPoints(meta.royaltyPercentage)
            }))

            if (meta.attributes) {
                setAttributes(meta.attributes)
            }
            if (meta.collection) {
                setCollectionSuggestion(meta.collection)
            }
            if (meta.summary) {
                setSummarySuggestion(meta.summary)
            }

            setAiSuccess(true)
        } catch (err) {
            const titleText = aiPrompt.length > 30 ? aiPrompt.slice(0, 30) + '...' : aiPrompt
            const fallbackTitle = titleText.charAt(0).toUpperCase() + titleText.slice(1) + ' (AI Art)'
            setForm(prev => ({
                ...prev,
                title: fallbackTitle,
                description: `An extraordinary digital collectible artwork inspired by "${aiPrompt}". Created on EpicMint decentralized NFT marketplace with immutable Pinata IPFS storage and Sepolia smart contract integration.`,
                category: 'art',
                tags: 'nft, art, collectible, epicmint, web3, digital',
                royalty: '250'
            }))
            setAttributes([
                { trait_type: 'Concept', value: aiPrompt.slice(0, 15) },
                { trait_type: 'Rarity', value: 'Rare' },
                { trait_type: 'Edition', value: 'Genesis Edition' },
                { trait_type: 'Network', value: 'Sepolia Testnet' }
            ])
            setCollectionSuggestion('EpicMint AI Originals')
            setSummarySuggestion('An elegant digital collectible artwork.')
            setAiSuccess(true)
        } finally {
            setAiLoading(false)
        }
    }

    const handleOptimizePrompt = async () => {
        if (!aiPrompt) return
        setAiLoading(true)
        setAiSuccess(false)
        setAiError('')
        try {
            const res = await aiAPI.optimizePrompt(aiPrompt)
            setAiPrompt(res.data?.optimized || `${aiPrompt}, 8k resolution, highly detailed, dramatic lighting, photorealistic digital art, trending on polycount`)
            setAiSuccess(true)
        } catch (err) {
            setAiPrompt(`${aiPrompt}, 8k resolution, highly detailed, dramatic lighting, photorealistic digital art, trending on polycount`)
            setAiSuccess(true)
        } finally {
            setAiLoading(false)
        }
    }

    const getRoyaltyBasisPoints = (percentage) => {
        if (!percentage) return '250'
        const pct = parseFloat(percentage)
        if (pct <= 0.5) return '0'
        if (pct <= 1.5) return '100'
        if (pct <= 3.5) return '250'
        if (pct <= 6.0) return '500'
        if (pct <= 8.5) return '750'
        return '1000'
    }

    const handleManualMetadataGeneration = async () => {
        if (!initialAiTitle || !initialAiDesc) return
        setAiLoading(true)
        setAiSuccess(false)
        setAiError('')
        try {
            const res = await aiAPI.generateMetadata(initialAiTitle, initialAiDesc)
            const meta = res.data.metadata

            setForm(prev => ({
                ...prev,
                title: meta.title || initialAiTitle,
                description: meta.description || initialAiDesc,
                category: meta.category || prev.category,
                tags: meta.tags?.join(', ') || prev.tags,
                royalty: getRoyaltyBasisPoints(meta.royaltyPercentage)
            }))

            if (meta.attributes) {
                setAttributes(meta.attributes)
            }
            if (meta.collection) {
                setCollectionSuggestion(meta.collection)
            }
            if (meta.summary) {
                setSummarySuggestion(meta.summary)
            }

            setAiSuccess(true)
        } catch (err) {
            setAiError(err.response?.data?.message || err.message || 'AI Metadata Generation failed.')
        } finally {
            setAiLoading(false)
        }
    }

    const handleFile = (f) => {
        if (!f) return
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
        if (!allowed.includes(f.type)) {
            setError('Invalid file type. Please upload JPG, PNG, GIF, WebP or SVG.')
            return
        }
        if (f.size > 10 * 1024 * 1024) {
            setError('File too large. Maximum 10MB.')
            return
        }
        setError('')
        setFile(f)
        setPreview(URL.createObjectURL(f))
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const dropped = e.dataTransfer.files[0]
        handleFile(dropped)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const canProceedStep0 = !!file
    const canProceedStep1 = form.title && form.description && form.category && form.price && parseFloat(form.price) > 0

    const handleSubmit = async () => {
        if (!isConnected) {
            try { await connect() } catch { return }
        }

        setStatus('uploading')
        setError('')

        try {
            // Step 1: Upload image
            updateTxStep(0, 'active')
            const imageRes = await uploadAPI.uploadImage(file, setUploadProgress)
            const { url: imageUrl, ipfsUrl, ipfsHash } = imageRes.data.data
            updateTxStep(0, 'done')

            // Step 2: Upload metadata
            updateTxStep(1, 'active')
            const metadataRes = await uploadAPI.uploadMetadata({
                name: form.title,
                description: form.description,
                image: ipfsUrl || imageUrl,
                attributes: attributes.length > 0 ? attributes : (form.tags ? form.tags.split(',').map(t => ({ trait_type: 'Tag', value: t.trim() })) : []),
            })
            const { ipfsUrl: metadataUrl, ipfsHash: metaHash } = metadataRes.data.data
            updateTxStep(1, 'done')

            // Step 3: Mint on blockchain (if contract is deployed)
            updateTxStep(2, 'active')
            setStatus('minting')
            let tokenId = ''
            let txHash = ''

            if (web3Service.isContractReady) {
                try {
                    const mintRes = await web3Service.mintNFT(
                        metadataUrl || imageUrl,
                        account,
                        parseInt(form.royalty)
                    )
                    tokenId = mintRes.tokenId
                    txHash = mintRes.txHash
                } catch (mintErr) {
                    console.warn('Blockchain mint failed:', mintErr.message)
                    // Continue with DB-only NFT in demo mode
                }
            }
            updateTxStep(2, 'done')

            // Step 4: Save to database
            updateTxStep(3, 'active')
            const nftRes = await nftAPI.create({
                title: form.title,
                description: form.description,
                category: form.category,
                price: parseFloat(form.price),
                imageUrl: imageUrl,
                ipfsHash: ipfsHash || '',
                ipfsMetadataHash: metaHash || '',
                tokenId,
                txHash,
                creatorAddress: account || '0x0000000000000000000000000000000000000000',
                royaltyPercentage: parseInt(form.royalty),
                tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                attributes: attributes,
            })
            updateTxStep(3, 'done')

            setMintResult(nftRes.data.data)
            setStatus('success')
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Minting failed')
            setStatus('error')
            // Reset tx steps that were active
            setTxSteps(prev => prev.map(s => s.state === 'active' ? { ...s, state: 'pending' } : s))
        }
    }

    // ===== SUCCESS VIEW =====
    if (status === 'success' && mintResult) {
        return (
            <div style={{ padding: '4rem 0' }}>
                <div className="container-sm" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                    <h1 style={{ marginBottom: '0.5rem' }} className="gradient-text">NFT Created!</h1>
                    <p className="text-secondary" style={{ marginBottom: '2rem' }}>
                        Your NFT has been successfully created
                        {web3Service.isContractReady && mintResult.txHash ? ' and minted on-chain' : ' and saved'}.
                    </p>
                    <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem' }}>
                        {mintResult.imageUrl && (
                            <img src={mintResult.imageUrl} alt={mintResult.title} style={{ width: '100%', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
                        )}
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{mintResult.title}</div>
                        <div className="text-sm text-muted" style={{ marginBottom: '0.75rem' }}>{mintResult.description}</div>
                        {mintResult.txHash && (
                            <div className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                                Tx: {mintResult.txHash.slice(0, 16)}...
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 justify-center">
                        <button className="btn btn-primary" onClick={() => navigate(`/nft/${mintResult._id}`)}>
                            View NFT
                        </button>
                        <button className="btn btn-secondary" onClick={() => { setStatus('idle'); setStep(0); setFile(null); setPreview(null); setForm({ title: '', description: '', category: 'art', price: '', royalty: '250', tags: '' }); setTxSteps(prev => prev.map(s => ({ ...s, state: 'pending' }))) }}>
                            Create Another
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{ padding: '2.5rem 0 4rem' }}>
            <SEO title="Create NFT Studio" description="Upload digital artwork, generate AI metadata with Google Gemini, and mint ERC-721 NFTs." />
            <div className="container-sm">
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div className="section-tag" style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>✨ Mint &amp; Create</div>
                    <h1 className="display-section">Create NFT</h1>
                    <p className="text-secondary" style={{ marginTop: '0.25rem' }}>
                        Upload your artwork, set details, and mint on-chain
                    </p>
                </div>

                {/* Step indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
                    {STEP_LABELS.map((label, i) => (
                        <React.Fragment key={i}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: i <= step ? 'var(--gradient-brand)' : 'var(--bg-card)',
                                    border: `2px solid ${i <= step ? 'transparent' : 'var(--border-color)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.8rem', fontWeight: 700,
                                    color: i <= step ? '#fff' : 'var(--text-muted)',
                                    transition: 'all 0.3s',
                                }}>
                                    {i < step ? '✓' : i + 1}
                                </div>
                                <span style={{ fontSize: '0.875rem', fontWeight: i === step ? 700 : 400, color: i === step ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                    {label}
                                </span>
                            </div>
                            {i < STEP_LABELS.length - 1 && (
                                <div style={{ flex: 1, height: 1, background: i < step ? 'var(--brand-purple)' : 'var(--border-color)', transition: 'background 0.3s' }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Wallet warning */}
                {!isConnected && (
                    <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
                        ⚠️ Connect your wallet to mint on-chain. You can still upload and save without a wallet.
                        <button className="btn btn-primary btn-sm" style={{ marginLeft: '1rem' }} onClick={connect}>
                            Connect Wallet
                        </button>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>❌ {error}</div>
                )}

                {/* ===== STEP 0: Upload ===== */}
                {step === 0 && (
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.25rem' }}>Upload Artwork</h3>

                        {preview ? (
                            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)' }} />
                                <button
                                    className="btn btn-danger btn-sm"
                                    style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}
                                    onClick={() => { setFile(null); setPreview(null) }}
                                >
                                    ✕ Remove
                                </button>
                            </div>
                        ) : (
                            <div
                                className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                                aria-label="Upload NFT file"
                                style={{ marginBottom: '1.5rem' }}
                            >
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🖼️</div>
                                <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Drag &amp; drop or click to upload</div>
                                <div className="text-sm text-muted">PNG, JPG, GIF, WebP, SVG — Max 10MB</div>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFile(e.target.files?.[0])}
                            id="nft-file-input"
                        />

                        <button
                            className="btn btn-primary w-full btn-lg"
                            disabled={!canProceedStep0}
                            onClick={() => setStep(1)}
                        >
                            Continue to Details →
                        </button>
                    </div>
                )}

                {/* ===== STEP 1: Details ===== */}
                {step === 1 && (
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>NFT Details</h3>
                        {/* AI Assistant Options Panel */}
                        <div className="card mb-4 animate-fade-up" style={{
                            padding: '1.5rem',
                            border: '1px dashed var(--brand-purple)',
                            background: 'rgba(124, 58, 237, 0.04)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem'
                        }}>
                            <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                                <span>🤖</span> Gemini AI NFT Creator
                            </h5>

                            {/* Tabs for AI features */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: 'var(--bg-input)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
                                <button
                                    type="button"
                                    className="btn btn-sm"
                                    style={{
                                        flex: 1,
                                        background: activeTab === 'copilot' ? 'var(--bg-card)' : 'transparent',
                                        color: activeTab === 'copilot' ? 'var(--text-primary)' : 'var(--text-muted)'
                                    }}
                                    onClick={() => setActiveTab('copilot')}
                                >
                                    💬 Copilot Prompt
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm"
                                    style={{
                                        flex: 1,
                                        background: activeTab === 'manual' ? 'var(--bg-card)' : 'transparent',
                                        color: activeTab === 'manual' ? 'var(--text-primary)' : 'var(--text-muted)'
                                    }}
                                    onClick={() => setActiveTab('manual')}
                                >
                                    📝 Manual Creation (AI Enhancer)
                                </button>
                            </div>

                            {/* View 1: Copilot Prompt */}
                            {activeTab === 'copilot' && (
                                <div>
                                    <p className="text-xs text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                                        Describe your digital asset's concept. Gemini AI will auto-populate the NFT Title, Description, Tags, and Rarity Traits.
                                    </p>
                                    <div className="flex gap-2 w-full" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. A pixelated celestial dragon holding a glowing crystal orb"
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            style={{ flex: 1, minWidth: '220px' }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={handleAIGeneration}
                                            disabled={aiLoading || !aiPrompt}
                                        >
                                            {aiLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '✨ Generate Details'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={handleOptimizePrompt}
                                            disabled={aiLoading || !aiPrompt}
                                            title="Enhance the detail modifiers of your prompt"
                                        >
                                            🚀 Optimize Prompt
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* View 2: Manual AI Metadata Enhancer */}
                            {activeTab === 'manual' && (
                                <div>
                                    <p className="text-xs text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                                        Enter your basic NFT Title and NFT Description. Gemini AI will automatically rewrite them into professional formats, suggest search tags, collection names, and attributes.
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <div className="form-group mb-0">
                                            <label className="form-label text-xs">Initial NFT Title</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="e.g. Cyber Punk Wolf"
                                                value={initialAiTitle}
                                                onChange={(e) => setInitialAiTitle(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group mb-0">
                                            <label className="form-label text-xs">Initial NFT Description</label>
                                            <textarea
                                                className="form-control form-control-sm"
                                                placeholder="e.g. A robotic wolf looking out over a neon futuristic city skyline"
                                                value={initialAiDesc}
                                                onChange={(e) => setInitialAiDesc(e.target.value)}
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm w-full"
                                        onClick={handleManualMetadataGeneration}
                                        disabled={aiLoading || !initialAiTitle || !initialAiDesc}
                                    >
                                        {aiLoading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Generating Metadata...</> : '✨ Generate AI Metadata'}
                                    </button>
                                    {collectionSuggestion && collectionSuggestion !== 'pending' && (
                                        <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '1rem', fontSize: '0.75rem' }}>
                                            💡 <strong>Suggested Collection Name:</strong> "{collectionSuggestion}"
                                            {summarySuggestion && <div style={{ marginTop: '0.25rem' }}>🎯 <strong>AI Summary:</strong> {summarySuggestion}</div>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {aiSuccess && <p className="text-xs text-success mb-0 mt-2" style={{ color: '#10b981', fontSize: '0.8rem' }}>✓ Loaded professional metadata! Review and edit any field below.</p>}
                            {aiError && <p className="text-xs text-danger mb-0 mt-2" style={{ color: '#ef4444', fontSize: '0.8rem' }}>⚠️ {aiError}</p>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <img src={preview} alt="Preview" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                                <p className="text-xs text-muted" style={{ marginTop: '0.5rem', textAlign: 'center' }}>{file?.name}</p>
                            </div>
                            <div>
                                <div className="form-group">
                                    <label htmlFor="title" className="form-label">Title *</label>
                                    <input id="title" name="title" className="form-control" value={form.title} onChange={handleChange} placeholder="My Awesome NFT" required maxLength={100} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description" className="form-label">Description *</label>
                                    <textarea id="description" name="description" className="form-control" value={form.description} onChange={handleChange} placeholder="Describe your NFT..." rows={3} maxLength={2000} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label htmlFor="category" className="form-label">Category *</label>
                                <select id="category" name="category" className="form-select" value={form.category} onChange={handleChange}>
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="price" className="form-label">Price (ETH) *</label>
                                <input id="price" name="price" type="number" className="form-control" value={form.price} onChange={handleChange} placeholder="0.00" step="0.001" min="0" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="royalty" className="form-label">Royalty (%)</label>
                                <select id="royalty" name="royalty" className="form-select" value={form.royalty} onChange={handleChange}>
                                    <option value="0">0%</option>
                                    <option value="100">1%</option>
                                    <option value="250">2.5% (recommended)</option>
                                    <option value="500">5%</option>
                                    <option value="750">7.5%</option>
                                    <option value="1000">10%</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="tags" className="form-label">Tags (comma-separated)</label>
                            <input id="tags" name="tags" className="form-control" value={form.tags} onChange={handleChange} placeholder="art, digital, abstract, colorful" />
                        </div>

                        {/* Generated Attributes Display */}
                        <div className="form-group mb-4">
                            <label className="form-label">Attributes (Properties)</label>
                            {attributes.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--bg-input)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                    {attributes.map((attr, idx) => (
                                        <div key={idx} className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.75rem' }}>
                                            <span style={{ opacity: 0.8 }}>{attr.trait_type}:</span>
                                            <strong>{attr.value}</strong>
                                            <button
                                                type="button"
                                                onClick={() => setAttributes(prev => prev.filter((_, i) => i !== idx))}
                                                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, marginLeft: '0.25rem', fontSize: '0.8rem' }}
                                                title="Delete attribute"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted" style={{ margin: 0, fontStyle: 'italic' }}>No properties generated yet. The AI Copilot can suggest traits based on your concept prompt.</p>
                            )}
                        </div>

                        <div className="flex gap-3" style={{ marginTop: '0.5rem' }}>
                            <button className="btn btn-ghost btn-lg" onClick={() => setStep(0)}>← Back</button>
                            <button
                                className="btn btn-primary btn-lg"
                                style={{ flex: 1 }}
                                disabled={!canProceedStep1}
                                onClick={() => setStep(2)}
                            >
                                Preview &amp; Mint →
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== STEP 2: Mint ===== */}
                {step === 2 && (
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Review &amp; Mint</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <img src={preview} alt="Preview" style={{ width: '100%', borderRadius: 'var(--radius-md)', aspectRatio: '1/1', objectFit: 'cover' }} />
                            <div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div className="text-xs text-muted" style={{ marginBottom: 4 }}>TITLE</div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{form.title}</div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div className="text-xs text-muted" style={{ marginBottom: 4 }}>DESCRIPTION</div>
                                    <div className="text-sm text-secondary">{form.description}</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <div className="text-xs text-muted" style={{ marginBottom: 4 }}>PRICE</div>
                                        <div className="nft-price">{form.price} ETH</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted" style={{ marginBottom: 4 }}>ROYALTY</div>
                                        <div style={{ fontWeight: 700 }}>{parseInt(form.royalty) / 100}%</div>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div className="text-xs text-muted" style={{ marginBottom: 4 }}>CATEGORY</div>
                                    <span className="badge badge-primary">{form.category}</span>
                                </div>
                                {!web3Service.isContractReady && (
                                    <div className="alert alert-warning" style={{ fontSize: '0.8rem' }}>
                                        ℹ️ No contract address configured — NFT will be saved to database only (demo mode).
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* TX Steps during minting */}
                        {(status === 'uploading' || status === 'minting') && (
                            <div className="tx-steps" style={{ marginBottom: '1.5rem' }}>
                                {txSteps.map((s, i) => (
                                    <div key={i} className={`tx-step ${s.state}`}>
                                        <div className="tx-step-dot" />
                                        <span>{s.label}</span>
                                        {s.state === 'active' && (
                                            <span className="spinner spinner-brand" style={{ marginLeft: 'auto', width: 14, height: 14 }} />
                                        )}
                                        {s.state === 'done' && <span style={{ marginLeft: 'auto' }}>✅</span>}
                                    </div>
                                ))}
                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <div style={{ background: 'var(--border-color)', borderRadius: 4, height: 4 }}>
                                            <div style={{ background: 'var(--gradient-brand)', width: `${uploadProgress}%`, height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
                                        </div>
                                        <div className="text-xs text-muted" style={{ marginTop: 4 }}>Upload: {uploadProgress}%</div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                className="btn btn-ghost btn-lg"
                                onClick={() => setStep(1)}
                                disabled={status === 'uploading' || status === 'minting'}
                            >
                                ← Back
                            </button>
                            <button
                                className="btn btn-primary btn-lg"
                                style={{ flex: 1 }}
                                onClick={handleSubmit}
                                disabled={status === 'uploading' || status === 'minting'}
                                id="mint-nft-btn"
                            >
                                {status === 'uploading' && <><span className="spinner" style={{ width: 16, height: 16 }} /> Uploading...</>}
                                {status === 'minting' && <><span className="spinner" style={{ width: 16, height: 16 }} /> Minting...</>}
                                {status === 'idle' && (isConnected ? '✨ Mint NFT' : '🔗 Connect &amp; Mint')}
                                {status === 'error' && '↺ Try Again'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Create
