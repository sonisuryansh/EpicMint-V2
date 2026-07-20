const express = require('express')
const router = express.Router()
const { getCommentsByNFT, createComment, deleteComment } = require('../controllers/commentController')
const { protect } = require('../middleware/auth')

// Public routes
router.get('/:nftId', getCommentsByNFT)

// Protected routes
router.post('/:nftId', protect, createComment)
router.delete('/:id', protect, deleteComment)

module.exports = router
