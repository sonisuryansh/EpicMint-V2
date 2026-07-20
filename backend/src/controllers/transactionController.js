const Transaction = require('../models/Transaction')
const { asyncHandler } = require('../middleware/errorHandler')

/**
 * GET /api/transactions/:tokenId
 * Get transactions history for a specific NFT by tokenId
 */
const getTransactions = asyncHandler(async (req, res) => {
    const { tokenId } = req.params
    const transactions = await Transaction.find({
        $or: [{ tokenId: tokenId }, { nft: tokenId }]
    }).sort({ createdAt: -1 })
    res.json({ success: true, transactions })
})

/**
 * POST /api/transactions
 * Create a new transaction log entry (mint, list, buy, unlist)
 */
const createTransaction = asyncHandler(async (req, res) => {
    const { tokenId, txHash, from, to, price, type } = req.body

    if (!tokenId || !txHash || !from || !to || price === undefined || !type) {
        return res.status(400).json({ success: false, message: 'All transaction log fields are required' })
    }

    const transaction = await Transaction.create({
        tokenId,
        txHash: txHash.toLowerCase(),
        from: from.toLowerCase(),
        to: to.toLowerCase(),
        price: parseFloat(price),
        type,
    })

    res.status(201).json({ success: true, transaction })
})

module.exports = {
    getTransactions,
    createTransaction,
}
