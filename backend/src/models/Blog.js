const mongoose = require('mongoose')

/**
 * Blog Schema — EpicMint Blog Module
 */
const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Blog title is required'],
            trim: true,
            minlength: [5, 'Title must be at least 5 characters'],
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        excerpt: {
            type: String,
            required: [true, 'Blog excerpt is required'],
            trim: true,
            maxlength: [500, 'Excerpt cannot exceed 500 characters'],
        },
        content: {
            type: String,
            required: [true, 'Blog content is required'],
        },
        coverImage: {
            type: String,
            required: [true, 'Cover image is required'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['Guides', 'Technology', 'Smart Contracts', 'AI & Tools', 'NFT', 'Security', 'DeFi', 'Community', 'Announcements'],
        },
        tags: {
            type: [String],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 10,
                message: 'Cannot have more than 10 tags',
            },
        },
        // Author info always set server-side from req.user — never trusted from frontend
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        authorName: {
            type: String,
            required: true,
        },
        authorAvatar: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['draft', 'published'],
            default: 'draft',
        },
        views: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Array of user IDs — enables toggle like and like count
        likedBy: {
            type: [mongoose.Schema.Types.ObjectId],
            default: [],
        },
        readTime: {
            type: String,
            default: '1 min read',
        },
        metaDescription: {
            type: String,
            maxlength: [160, 'Meta description cannot exceed 160 characters'],
            default: '',
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id
                delete ret.__v
                return ret
            },
        },
    }
)

// Virtual: like count derived from likedBy array length
blogSchema.virtual('likes').get(function () {
    return this.likedBy.length
})

// Performance indexes
blogSchema.index({ status: 1, createdAt: -1 })
blogSchema.index({ category: 1, status: 1 })
blogSchema.index({ authorId: 1, status: 1 })
blogSchema.index({ views: -1 })
blogSchema.index({ title: 'text', excerpt: 'text' })

/**
 * Generate a unique URL-safe slug from a title.
 * Appends a random suffix if the base slug is already taken.
 */
blogSchema.statics.generateSlug = async function (title) {
    const base = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80)
        .replace(/^-|-$/g, '')

    const exists = await this.findOne({ slug: base })
    if (!exists) return base

    let unique
    do {
        const suffix = Math.random().toString(36).slice(2, 7)
        unique = `${base}-${suffix}`
    } while (await this.findOne({ slug: unique }))

    return unique
}

module.exports = mongoose.model('Blog', blogSchema)
