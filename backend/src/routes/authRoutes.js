const express = require('express')
const router = express.Router()
const {
    register,
    login,
    googleAuth,
    walletAuth,
    linkGoogle,
    linkWallet,
    unlinkWallet,
    getNonce,
    getMe,
    updateProfile,
    followUser,
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')

router.post('/register', register)
router.post('/login', login)
router.post('/google', googleAuth)
router.post('/wallet', walletAuth)
router.post('/link-google', protect, linkGoogle)
router.post('/link-wallet', protect, linkWallet)
router.post('/unlink-wallet', protect, unlinkWallet)
router.get('/nonce/:walletAddress', getNonce)
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.post('/follow/:target', protect, followUser)

module.exports = router
