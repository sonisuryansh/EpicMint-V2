const express = require('express')
const router = express.Router()
const {
    getAllNFTs,
    getNFTById,
    createNFT,
    updateNFT,
    deleteNFT,
    likeNFT,
    getStats,
    buyNFT,
} = require('../controllers/nftController')
const { protect, optionalAuth, authorize } = require('../middleware/auth')

router.get('/stats', getStats)
router.get('/', optionalAuth, getAllNFTs)
router.get('/:id', optionalAuth, getNFTById)
router.get('/:contractAddress/:tokenId', optionalAuth, getNFTById)
router.post('/', protect, createNFT)
router.post('/:id/buy', optionalAuth, buyNFT)
router.put('/:id', protect, updateNFT)
router.delete('/:id', protect, deleteNFT)
router.post('/:id/like', likeNFT)

module.exports = router
