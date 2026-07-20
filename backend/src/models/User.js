const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username cannot exceed 30 characters'],
        },
        email: {
            type: String,
            sparse: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        passwordHash: {
            type: String,
            select: false,
        },
        walletAddress: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters'],
            default: '',
        },
        avatar: {
            type: String,
            default: '',
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        nonce: {
            type: String,
            default: () => Math.floor(Math.random() * 1000000).toString(),
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        preferences: {
            theme: {
                type: String,
                enum: ['light', 'dark'],
                default: 'dark',
            },
            notifications: {
                type: Boolean,
                default: true,
            },
        },
        followers: [
            {
                type: String,
                lowercase: true,
                trim: true,
            },
        ],
        following: [
            {
                type: String,
                lowercase: true,
                trim: true,
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                delete ret.passwordHash
                delete ret.__v
                return ret
            },
        },
    }
)

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next()
    if (this.passwordHash) {
        this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
    }
    next()
})

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.passwordHash) return false
    return bcrypt.compare(candidatePassword, this.passwordHash)
}

// Generate new nonce (for wallet auth)
userSchema.methods.generateNonce = function () {
    this.nonce = Math.floor(Math.random() * 1000000).toString()
    return this.nonce
}

// Indexes
userSchema.index({ createdAt: -1 })

module.exports = mongoose.model('User', userSchema)
