const jwt = require('jsonwebtoken')
const { ethers } = require('ethers')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const { asyncHandler } = require('../middleware/errorHandler')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)


const signToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })
}

const sendTokenResponse = (user, statusCode, res) => {
    const token = signToken(user._id)
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            walletAddress: user.walletAddress,
            googleId: user.googleId,
            avatar: user.avatar,
            role: user.role,
        },
    })
}


const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required' })
    }

    const existing = email ? await User.findOne({ email }) : null
    if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered' })
    }

    const user = await User.create({
        username,
        email: email || undefined,
        passwordHash: password || undefined,
    })

    sendTokenResponse(user, 201, res)
})


const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const user = await User.findOne({ email }).select('+passwordHash')
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    sendTokenResponse(user, 200, res)
})


const googleAuth = asyncHandler(async (req, res) => {
    const { idToken } = req.body

    if (!idToken) {
        return res.status(400).json({ success: false, message: 'Google ID Token is required' })
    }

    let payload
    try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        })
        payload = ticket.getPayload()
    } catch (err) {
        console.error('Google ID Token verification failed:', err.message)
        return res.status(401).json({ success: false, message: `Invalid Google ID Token: ${err.message}`, error: err.message })
    }

    const { sub: googleId, email, name, picture } = payload

    let user = await User.findOne({ googleId })

    if (user) {
        if (picture) user.avatar = picture
        await user.save()
    } else if (email) {

        user = await User.findOne({ email })
        if (user) {
            user.googleId = googleId
            if (picture) user.avatar = picture
            await user.save()
        }
    }

    if (!user) {

        user = await User.create({
            username: name || `user_${googleId.slice(-6)}`,
            email: email,
            googleId: googleId,
            avatar: picture || '',
        })
    }

    sendTokenResponse(user, 200, res)
})


const walletAuth = asyncHandler(async (req, res) => {
    const { walletAddress, signature, message } = req.body

    if (!walletAddress || !signature || !message) {
        return res.status(400).json({
            success: false,
            message: 'walletAddress, signature, and message are required',
        })
    }

    const formattedAddress = walletAddress.toLowerCase()

    // ✅ Verify signature FIRST before creating any DB records
    try {
        const recoveredAddress = ethers.verifyMessage(message, signature)
        if (recoveredAddress.toLowerCase() !== formattedAddress) {
            return res.status(401).json({ success: false, message: 'Invalid signature. Address mismatch.' })
        }
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Cryptographic signature verification failed', error: err.message })
    }

    // Only create/fetch user after signature is confirmed valid
    let user = await User.findOne({ walletAddress: formattedAddress })

    if (!user) {
        user = await User.create({
            username: `user_${formattedAddress.slice(2, 8)}`,
            walletAddress: formattedAddress,
        })
    }

    user.generateNonce()
    await user.save()

    sendTokenResponse(user, 200, res)
})

const linkGoogle = asyncHandler(async (req, res) => {
    const { idToken } = req.body

    if (!idToken) {
        return res.status(400).json({ success: false, message: 'Google ID Token is required' })
    }

    let payload
    try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        })
        payload = ticket.getPayload()
    } catch (err) {
        return res.status(401).json({ success: false, message: `Invalid Google ID Token: ${err.message}` })
    }

    const { sub: googleId, picture } = payload

    // Check if googleId is already linked to another account
    const existing = await User.findOne({ googleId })
    if (existing && existing._id.toString() !== req.user.id) {
        return res.status(409).json({ success: false, message: 'This Google account is already linked to another user' })
    }

    const user = await User.findById(req.user.id)
    user.googleId = googleId
    if (picture) user.avatar = picture
    await user.save()

    res.json({ success: true, message: 'Google account linked successfully', user })
})

/**
 * POST /api/auth/link-wallet
 * Links a MetaMask wallet to the currently logged in user session
 */
const linkWallet = asyncHandler(async (req, res) => {
    const { walletAddress, signature, message } = req.body

    if (!walletAddress || !signature || !message) {
        return res.status(400).json({ success: false, message: 'walletAddress, signature, and message are required' })
    }

    const formattedAddress = walletAddress.toLowerCase()

    // Verify signature
    try {
        const recoveredAddress = ethers.verifyMessage(message, signature)
        if (recoveredAddress.toLowerCase() !== formattedAddress) {
            return res.status(401).json({ success: false, message: 'Signature verification failed' })
        }
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Signature verification failed', error: err.message })
    }

    // Check if walletAddress is already linked to another account
    const existing = await User.findOne({ walletAddress: formattedAddress })
    if (existing && existing._id.toString() !== req.user.id) {
        return res.status(409).json({ success: false, message: 'This wallet address is already linked to another user' })
    }

    const user = await User.findById(req.user.id)
    user.walletAddress = formattedAddress
    user.generateNonce()
    await user.save()

    res.json({ success: true, message: 'MetaMask wallet linked successfully', user })
})

/**
 * POST /api/auth/unlink-wallet
 * Removes MetaMask wallet link from the user account
 */
const unlinkWallet = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
    user.walletAddress = undefined
    await user.save()
    res.json({ success: true, message: 'MetaMask wallet address unlinked successfully', user })
})

/**
 * GET /api/auth/nonce/:walletAddress
 * Returns a nonce for wallet signature verification
 */
const getNonce = asyncHandler(async (req, res) => {
    const { walletAddress } = req.params

    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    if (!user) {
        user = await User.create({
            username: `user_${walletAddress.slice(2, 8).toLowerCase()}`,
            walletAddress: walletAddress.toLowerCase(),
        })
    }

    const nonce = user.generateNonce()
    await user.save()

    res.json({
        success: true,
        nonce,
        message: `Sign this message to authenticate with EpicMint: ${nonce}`,
    })
})

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
    res.json({ success: true, user })
})

/**
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
    const { username, bio, avatar, preferences } = req.body
    const updates = {}
    if (username) updates.username = username
    if (bio !== undefined) updates.bio = bio
    if (avatar !== undefined) updates.avatar = avatar
    if (preferences !== undefined) updates.preferences = preferences

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
    })

    res.json({ success: true, user })
})

/**
 * POST /api/auth/follow/:target
 * Toggle follow/unfollow a creator user by ID or wallet address
 */
const followUser = asyncHandler(async (req, res) => {
    const { target } = req.params
    const currentUserId = req.user?.id
    const currentUserWallet = req.user?.walletAddress?.toLowerCase()

    if (!target) {
        return res.status(400).json({ success: false, message: 'Target user ID or wallet address required' })
    }

    const targetLower = target.toLowerCase()
    const currentUser = await User.findById(currentUserId)

    if (!currentUser) {
        return res.status(404).json({ success: false, message: 'User profile not found' })
    }

    const mongoose = require('mongoose')
    let targetUser = await User.findOne({
        $or: [
            { _id: mongoose.Types.ObjectId.isValid(target) ? target : null },
            { walletAddress: targetLower }
        ]
    })

    const targetIdentifier = targetUser ? targetUser._id.toString() : targetLower
    const currentIdentifier = currentUser._id.toString()

    // Prevent self-following
    if (targetIdentifier === currentIdentifier || targetLower === currentUserWallet) {
        return res.status(400).json({ success: false, message: 'You cannot follow yourself' })
    }

    if (!currentUser.following) currentUser.following = []
    const isFollowing = currentUser.following.includes(targetIdentifier) || currentUser.following.includes(targetLower)

    if (isFollowing) {
        currentUser.following = currentUser.following.filter(id => id !== targetIdentifier && id !== targetLower)
        if (targetUser) {
            targetUser.followers = (targetUser.followers || []).filter(id => id !== currentIdentifier && id !== currentUserWallet)
            await targetUser.save()
        }
    } else {
        currentUser.following.push(targetIdentifier)
        if (targetUser) {
            if (!targetUser.followers) targetUser.followers = []
            targetUser.followers.push(currentIdentifier)
            await targetUser.save()
        }
    }

    await currentUser.save()

    res.json({
        success: true,
        isFollowing: !isFollowing,
        user: currentUser,
        message: !isFollowing ? 'User followed successfully' : 'User unfollowed successfully'
    })
})

module.exports = {
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
}
