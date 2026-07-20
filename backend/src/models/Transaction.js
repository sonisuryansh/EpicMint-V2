const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema(
    {
        tokenId: {
            type: String,
            required: [true, 'Token ID is required'],
        },
        txHash: {
            type: String,
            required: [true, 'Transaction hash is required'],
            lowercase: true,
        },
        from: {
            type: String,
            required: [true, 'From address is required'],
            lowercase: true,
        },
        to: {
            type: String,
            required: [true, 'To address is required'],
            lowercase: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
        },
        type: {
            type: String,
            enum: ['mint', 'list', 'buy', 'unlist', 'transfer'],
            required: [true, 'Transaction type is required'],
        },
    },
    {
        timestamps: true,
    }
)

transactionSchema.index({ tokenId: 1, createdAt: -1 })
transactionSchema.index({ from: 1 })
transactionSchema.index({ to: 1 })

module.exports = mongoose.model('Transaction', transactionSchema)
