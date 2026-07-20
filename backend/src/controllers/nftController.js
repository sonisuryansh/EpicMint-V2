const NFT = require('../models/NFT')
const { asyncHandler } = require('../middleware/errorHandler')

// Fetch paginated, filtered, and sorted NFT listings
const getAllNFTs = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 12,
        category,
        status,
        minPrice,
        maxPrice,
        search,
        sort = 'newest',
        creatorAddress,
        ownerAddress,
    } = req.query

    const filter = {}

    if (category) filter.category = category
    if (status) filter.status = status
    if (creatorAddress) filter.creatorAddress = creatorAddress.toLowerCase()
    if (ownerAddress) filter.ownerAddress = ownerAddress.toLowerCase()

    if (minPrice || maxPrice) {
        filter.price = {}
        if (minPrice) filter.price.$gte = parseFloat(minPrice)
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
    }

    if (search) {
        filter.$text = { $search: search }
    }

    const sortOptions = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        price_asc: { price: 1 },
        price_desc: { price: -1 },
        popular: { views: -1 },
    }

    const sortBy = sortOptions[sort] || sortOptions.newest
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [nfts, total] = await Promise.all([
        NFT.find(filter)
            .sort(sortBy)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('creator', 'username avatar walletAddress'),
        NFT.countDocuments(filter),
    ])

    // Sanitize likes count to array length
    const sanitizedNfts = nfts.map(nft => {
        const obj = nft.toObject()
        obj.likes = Array.isArray(obj.likedBy) ? obj.likedBy.length : 0
        return obj
    })

    res.json({
        success: true,
        data: sanitizedNfts,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit)),
            hasNext: skip + nfts.length < total,
            hasPrev: parseInt(page) > 1,
        },
    })
})

// Fetch single NFT detail by MongoDB ID or contract address & token ID
const getNFTById = asyncHandler(async (req, res) => {
    const { id, contractAddress, tokenId } = req.params
    let query = {}

    if (contractAddress && tokenId) {
        query = {
            contractAddress: contractAddress.toLowerCase(),
            tokenId: tokenId,
        }
    } else if (id) {
        const mongoose = require('mongoose')
        if (mongoose.Types.ObjectId.isValid(id)) {
            query = { _id: id }
        } else {
            query = { tokenId: id }
        }
    }

    const nft = await NFT.findOne(query).populate(
        'creator',
        'username avatar walletAddress'
    )

    if (!nft) {
        return res.status(404).json({ success: false, message: 'NFT not found' })
    }

    // Increment view count
    nft.views = (nft.views || 0) + 1
    await nft.save()

    res.json({ success: true, data: nft })
})

// Create and store new NFT metadata document in MongoDB
const createNFT = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        category,
        price,
        imageUrl,
        image,
        gatewayUrl,
        ipfsHash,
        ipfsMetadataHash,
        metadataCID,
        tokenId,
        tokenURI,
        metadataURI,
        ipfsCID,
        contractAddress,
        chainId,
        txHash,
        creatorAddress,
        royaltyPercentage,
        attributes,
        tags,
    } = req.body

    const rawImg = imageUrl || gatewayUrl || (ipfsCID ? `https://gateway.pinata.cloud/ipfs/${ipfsCID}` : '')
    if (!title || !description || !category || price === undefined || !rawImg || !creatorAddress) {
        return res.status(400).json({
            success: false,
            message: 'title, description, category, price, image/imageUrl, and creatorAddress are required',
        })
    }

    const resolvedIpfsCID = ipfsCID || ipfsHash || ''
    const resolvedMetadataCID = metadataCID || ipfsMetadataHash || ''
    const resolvedGatewayUrl = gatewayUrl || (resolvedIpfsCID ? `https://gateway.pinata.cloud/ipfs/${resolvedIpfsCID}` : rawImg)
    const resolvedImage = image || (resolvedIpfsCID ? `ipfs://${resolvedIpfsCID}` : rawImg)
    const resolvedTokenURI = tokenURI || metadataURI || (resolvedMetadataCID ? `ipfs://${resolvedMetadataCID}` : '')

    const nft = await NFT.create({
        title,
        description,
        category,
        price: parseFloat(price),
        imageUrl: resolvedGatewayUrl,
        image: resolvedImage,
        gatewayUrl: resolvedGatewayUrl,
        ipfsCID: resolvedIpfsCID,
        ipfsHash: resolvedIpfsCID,
        metadataCID: resolvedMetadataCID,
        ipfsMetadataHash: resolvedMetadataCID,
        tokenId: tokenId || '',
        tokenURI: resolvedTokenURI,
        metadataURI: resolvedTokenURI,
        contractAddress: contractAddress ? contractAddress.toLowerCase() : '',
        chainId: chainId || 11155111,
        txHash: txHash || '',
        creatorAddress: creatorAddress.toLowerCase(),
        ownerAddress: creatorAddress.toLowerCase(),
        creator: req.user?._id,
        royaltyPercentage: royaltyPercentage || 250,
        attributes: attributes || [],
        tags: tags || [],
        status: tokenId ? 'minted' : 'pending',
    })

    res.status(201).json({ success: true, data: nft })
})

// Update NFT fields by authorized creator or owner
const updateNFT = asyncHandler(async (req, res) => {
    const nft = await NFT.findById(req.params.id)

    if (!nft) {
        return res.status(404).json({ success: false, message: 'NFT not found' })
    }

    // Verify creator, owner, or admin authorization
    const userWallet = req.user?.walletAddress?.toLowerCase()
    const isOwner = nft.ownerAddress?.toLowerCase() === userWallet
    const isCreator = nft.creatorAddress?.toLowerCase() === userWallet
    const isAdmin = req.user?.role === 'admin'

    if (!isAdmin && !isOwner && !isCreator) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this NFT' })
    }

    const allowedFields = [
        'title', 'description', 'category', 'price', 'status',
        'tokenId', 'txHash', 'ipfsHash', 'ipfsMetadataHash',
        'ownerAddress', 'tags', 'attributes', 'tokenURI',
        'metadataURI', 'ipfsCID', 'contractAddress', 'chainId'
    ]

    const updates = {}
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updates[field] = typeof req.body[field] === 'string' && field.endsWith('Address')
                ? req.body[field].toLowerCase()
                : req.body[field]
        }
    })

    const updated = await NFT.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
    })

    res.json({ success: true, data: updated })
})

// Delete NFT document from database
const deleteNFT = asyncHandler(async (req, res) => {
    const nft = await NFT.findById(req.params.id)

    if (!nft) {
        return res.status(404).json({ success: false, message: 'NFT not found' })
    }

    if (
        req.user?.role !== 'admin' &&
        nft.creatorAddress !== req.user?.walletAddress?.toLowerCase()
    ) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this NFT' })
    }

    await nft.deleteOne()
    res.json({ success: true, message: 'NFT deleted successfully' })
})

// Toggle user like status per unique account
const likeNFT = asyncHandler(async (req, res) => {
    const nft = await NFT.findById(req.params.id)
    if (!nft) return res.status(404).json({ success: false, message: 'NFT not found' })

    const rawId = req.user?.walletAddress ||
                  req.user?._id?.toString() ||
                  (req.body?.userAddress && req.body.userAddress.trim()) ||
                  req.body?.userId ||
                  req.ip ||
                  'anonymous'

    const identifier = rawId.toString().toLowerCase().trim()

    if (!Array.isArray(nft.likedBy)) {
        nft.likedBy = []
    }

    const index = nft.likedBy.indexOf(identifier)
    let isLiked = false

    if (index > -1) {
        nft.likedBy.splice(index, 1)
        isLiked = false
    } else {
        nft.likedBy.push(identifier)
        isLiked = true
    }

    nft.likes = nft.likedBy.length
    await nft.save()

    res.json({ success: true, likes: nft.likes, isLiked })
})

// Fetch global marketplace statistics overview
const getStats = asyncHandler(async (req, res) => {
    const [totalNFTs, totalMinted, totalListed, recentNFTs] = await Promise.all([
        NFT.countDocuments(),
        NFT.countDocuments({ status: 'minted' }),
        NFT.countDocuments({ status: 'listed' }),
        NFT.find().sort({ createdAt: -1 }).limit(4).select('title price imageUrl category status'),
    ])

    res.json({
        success: true,
        data: {
            totalNFTs,
            totalMinted,
            totalListed,
            recentNFTs,
        },
    })
})

// Process NFT purchase and record transaction history
const buyNFT = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { buyerAddress, txHash, price } = req.body

    if (!buyerAddress || !txHash) {
        return res.status(400).json({ success: false, message: 'buyerAddress and txHash are required' })
    }

    const nft = await NFT.findById(id)
    if (!nft) {
        return res.status(404).json({ success: false, message: 'NFT not found' })
    }

    const previousOwner = nft.ownerAddress || nft.creatorAddress

    // Update NFT owner and status in MongoDB
    nft.ownerAddress = buyerAddress.toLowerCase()
    nft.status = 'sold'
    await nft.save()

    // Create transaction log entry
    const Transaction = require('../models/Transaction')
    const transaction = await Transaction.create({
        tokenId: nft.tokenId || nft._id.toString(),
        txHash: txHash.toLowerCase(),
        from: previousOwner.toLowerCase(),
        to: buyerAddress.toLowerCase(),
        price: price ? parseFloat(price) : nft.price,
        type: 'buy',
    })

    res.json({
        success: true,
        message: 'NFT purchased successfully',
        data: nft,
        transaction,
    })
})

module.exports = { getAllNFTs, getNFTById, createNFT, updateNFT, deleteNFT, likeNFT, getStats, buyNFT }
