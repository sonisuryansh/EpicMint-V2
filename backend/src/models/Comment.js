const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
    {
        nft: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'NFT',
            required: [true, 'NFT reference is required'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
        },
        text: {
            type: String,
            required: [true, 'Comment text is required'],
            trim: true,
            maxlength: [1000, 'Comment cannot exceed 1000 characters'],
        },
    },
    {
        timestamps: true,
    }
)

commentSchema.index({ nft: 1, createdAt: -1 })

module.exports = mongoose.model('Comment', commentSchema)
