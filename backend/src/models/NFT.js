const mongoose = require('mongoose')

const nftSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'NFT title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'NFT description is required'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['art', 'gaming', 'collectibles', 'music', 'photography', 'sports', 'utility'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        currency: {
            type: String,
            default: 'ETH',
        },
        imageUrl: {
            type: String,
            required: [true, 'Image URL is required'],
        },
        image: {
            type: String,
            default: '',
        },
        gatewayUrl: {
            type: String,
            default: '',
        },
        ipfsHash: {
            type: String,
            default: '',
        },
        ipfsMetadataHash: {
            type: String,
            default: '',
        },
        tokenId: {
            type: String,
            default: '',
        },
        tokenURI: {
            type: String,
            default: '',
        },
        metadataURI: {
            type: String,
            default: '',
        },
        ipfsCID: {
            type: String,
            default: '',
        },
        metadataCID: {
            type: String,
            default: '',
        },
        contractAddress: {
            type: String,
            lowercase: true,
            default: '',
        },
        chainId: {
            type: Number,
            default: 11155111, // Sepolia
        },
        txHash: {
            type: String,
            default: '',
        },
        creatorAddress: {
            type: String,
            required: [true, 'Creator address is required'],
            lowercase: true,
        },
        ownerAddress: {
            type: String,
            required: [true, 'Owner address is required'],
            lowercase: true,
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        status: {
            type: String,
            enum: ['pending', 'minted', 'listed', 'sold', 'unlisted'],
            default: 'pending',
        },
        royaltyPercentage: {
            type: Number,
            default: 250, // 2.5% in basis points
            min: 0,
            max: 1000,
        },
        views: {
            type: Number,
            default: 0,
        },
        likes: {
            type: Number,
            default: 0,
        },
        likedBy: [String],
        attributes: [
            {
                trait_type: String,
                value: mongoose.Schema.Types.Mixed,
            },
        ],
        tags: [String],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// Indexes for common queries
nftSchema.index({ creatorAddress: 1 })
nftSchema.index({ ownerAddress: 1 })
nftSchema.index({ status: 1 })
nftSchema.index({ category: 1 })
nftSchema.index({ price: 1 })
nftSchema.index({ createdAt: -1 })
nftSchema.index({ title: 'text', description: 'text', tags: 'text' })

module.exports = mongoose.model('NFT', nftSchema)
