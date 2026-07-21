const Blog = require('../models/Blog')

/**
 * Blog ownership middleware.
 * Must be used AFTER protect middleware (req.user must be set).
 * Loads the blog from DB and blocks the request if the authenticated user
 * is NOT the author AND NOT an admin. Returns 403 Forbidden.
 */
const blogOwner = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id)

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' })
        }

        const isOwner = blog.authorId.toString() === req.user._id.toString()
        const isAdmin = req.user.role === 'admin'

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden — you do not have permission to modify this blog',
            })
        }

        req.blog = blog
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = blogOwner
