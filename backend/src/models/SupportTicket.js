const mongoose = require('mongoose')

const supportTicketSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
        },
        walletAddress: {
            type: String,
            trim: true,
            default: '',
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
        },
        category: {
            type: String,
            enum: ['General Question', 'Minting & IPFS', 'Wallet & Web3', 'Marketplace & Payments', 'Bug Report', 'Other'],
            default: 'General Question',
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
        },
        attachment: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['open', 'in-progress', 'resolved', 'closed'],
            default: 'open',
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('SupportTicket', supportTicketSchema)
