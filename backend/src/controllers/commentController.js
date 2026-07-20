const Comment = require('../models/Comment')
const { asyncHandler } = require('../middleware/errorHandler')

/**
 * GET /api/comments/:nftId
 * Get comments for a specific NFT
 */
const getCommentsByNFT = asyncHandler(async (req, res) => {
    const { nftId } = req.params
    const comments = await Comment.find({ nft: nftId })
        .populate('user', 'username avatar walletAddress')
        .sort({ createdAt: -1 })

    res.json({ success: true, comments })
})

/**
 * POST /api/comments/:nftId
 * Add a new comment to an NFT
 */
const createComment = asyncHandler(async (req, res) => {
    const { nftId } = req.params
    const { text } = req.body

    if (!text) {
        return res.status(400).json({ success: false, message: 'Comment text is required' })
    }

    const comment = await Comment.create({
        nft: nftId,
        user: req.user.id,
        text,
    })

    // Populate user info for the response
    const populated = await comment.populate('user', 'username avatar walletAddress')

    res.status(201).json({ success: true, comment: populated })
})

/**
 * DELETE /api/comments/:id
 * Delete a comment (must be owner or admin)
 */
const deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
        return res.status(404).json({ success: false, message: 'Comment not found' })
    }

    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' })
    }

    await comment.deleteOne()
    res.json({ success: true, message: 'Comment deleted successfully' })
})

module.exports = {
    getCommentsByNFT,
    createComment,
    deleteComment,
}
