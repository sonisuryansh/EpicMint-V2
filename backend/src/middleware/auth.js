const jwt = require('jsonwebtoken')
const User = require('../models/User')

/**
 * Protect routes — verifies JWT token
 */
const protect = async (req, res, next) => {
    try {
        let token

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized — no token provided',
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('-passwordHash')

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User no longer exists',
            })
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Account is deactivated',
            })
        }

        req.user = user
        next()
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, error: 'Invalid token' })
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Token expired' })
        }
        next(error)
    }
}

/**
 * Optional auth — attaches user if token present but doesn't block
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1]
        }
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await User.findById(decoded.id).select('-passwordHash')
        }
        next()
    } catch {
        next()
    }
}

/**
 * Role-based authorization
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role)) {
            return res.status(403).json({
                success: false,
                error: `Role '${req.user?.role}' is not authorized for this action`,
            })
        }
        next()
    }
}

module.exports = { protect, optionalAuth, authorize }
