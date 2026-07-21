const Blog = require('../models/Blog')
const { asyncHandler } = require('../middleware/errorHandler')

/** Estimate read time from markdown content (~200 wpm) */
const calcReadTime = (content) => {
    const words = content.trim().split(/\s+/).length
    const minutes = Math.max(1, Math.ceil(words / 200))
    return `${minutes} min read`
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/blogs
// Public (optionalAuth). Paginated list with search, category, sort.
// ─────────────────────────────────────────────────────────────────────────────
const getBlogs = asyncHandler(async (req, res) => {
    const { search, category, sort = 'latest', page = 1, limit = 6, author } = req.query

    const query = { status: 'published' }

    if (category && category !== 'All') query.category = category
    if (author) query.authorId = author
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { excerpt: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } },
        ]
    }

    const sortOpts = sort === 'popular' ? { views: -1 } : { createdAt: -1 }
    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)))
    const skip = (pageNum - 1) * limitNum

    const [blogs, total] = await Promise.all([
        Blog.find(query).sort(sortOpts).skip(skip).limit(limitNum).select('-likedBy -content').lean({ virtuals: true }),
        Blog.countDocuments(query),
    ])

    res.json({
        success: true,
        data: {
            blogs,
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
        },
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/blogs/:slug
// Public (optionalAuth). Full blog + userLiked flag.
// ─────────────────────────────────────────────────────────────────────────────
const getBlogBySlug = asyncHandler(async (req, res) => {
    const blog = await Blog.findOne({ slug: req.params.slug })

    if (!blog || blog.status !== 'published') {
        return res.status(404).json({ success: false, message: 'Blog not found' })
    }

    const userLiked = req.user
        ? blog.likedBy.some((id) => id.toString() === req.user._id.toString())
        : false

    const blogObj = blog.toJSON()
    blogObj.userLiked = userLiked

    res.json({ success: true, data: { blog: blogObj } })
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/blogs
// Protected. Author info always from req.user — never from body.
// ─────────────────────────────────────────────────────────────────────────────
const createBlog = asyncHandler(async (req, res) => {
    const { title, excerpt, content, coverImage, category, tags, status, metaDescription } = req.body

    if (!title || !excerpt || !content || !coverImage || !category) {
        return res.status(400).json({
            success: false,
            message: 'title, excerpt, content, coverImage, and category are required',
        })
    }

    const slug = await Blog.generateSlug(title)

    const blog = await Blog.create({
        title: title.trim(),
        slug,
        excerpt: excerpt.trim(),
        content,
        coverImage,
        category,
        tags: Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean) : [],
        // Author always sourced from server — frontend cannot inject this
        authorId: req.user._id,
        authorName: req.user.username,
        authorAvatar: req.user.avatar || '',
        status: status === 'published' ? 'published' : 'draft',
        readTime: calcReadTime(content),
        metaDescription: (metaDescription || excerpt).trim().slice(0, 160),
    })

    res.status(201).json({
        success: true,
        message: status === 'published' ? 'Blog published!' : 'Draft saved!',
        data: { blog },
    })
})

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/blogs/:id
// Protected + blogOwner. req.blog already loaded by middleware.
// ─────────────────────────────────────────────────────────────────────────────
const updateBlog = asyncHandler(async (req, res) => {
    const blog = req.blog
    const { title, excerpt, content, coverImage, category, tags, status, metaDescription } = req.body

    if (title) {
        blog.title = title.trim()
        // Only regenerate slug if title changed (avoid breaking existing links)
        const newSlug = await Blog.generateSlug(title)
        if (newSlug !== blog.slug) blog.slug = newSlug
    }
    if (excerpt !== undefined) blog.excerpt = excerpt.trim()
    if (content !== undefined) {
        blog.content = content
        blog.readTime = calcReadTime(content)
    }
    if (coverImage !== undefined) blog.coverImage = coverImage
    if (category !== undefined) blog.category = category
    if (tags !== undefined) blog.tags = Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean) : []
    if (status !== undefined) blog.status = status
    if (metaDescription !== undefined) blog.metaDescription = metaDescription.trim().slice(0, 160)

    await blog.save()

    res.json({ success: true, message: 'Blog updated!', data: { blog } })
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/blogs/:id
// Protected + blogOwner.
// ─────────────────────────────────────────────────────────────────────────────
const deleteBlog = asyncHandler(async (req, res) => {
    await req.blog.deleteOne()
    res.json({ success: true, message: 'Blog deleted successfully!' })
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/blogs/:id/view — atomic view increment (public)
// ─────────────────────────────────────────────────────────────────────────────
const incrementView = asyncHandler(async (req, res) => {
    const blog = await Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true, select: 'views' })
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' })
    res.json({ success: true, data: { views: blog.views } })
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/blogs/:id/like — toggle like (protected)
// ─────────────────────────────────────────────────────────────────────────────
const toggleLike = asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' })

    const userId = req.user._id
    const alreadyLiked = blog.likedBy.some((id) => id.toString() === userId.toString())

    if (alreadyLiked) {
        blog.likedBy = blog.likedBy.filter((id) => id.toString() !== userId.toString())
    } else {
        blog.likedBy.push(userId)
    }

    await blog.save()

    res.json({
        success: true,
        data: { likes: blog.likedBy.length, userLiked: !alreadyLiked },
    })
})

module.exports = { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog, incrementView, toggleLike }
