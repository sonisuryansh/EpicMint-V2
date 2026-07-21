const express = require('express')
const router = express.Router()
const { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog, incrementView, toggleLike } = require('../controllers/blogController')
const { protect, optionalAuth } = require('../middleware/auth')
const blogOwner = require('../middleware/blogOwner')

router.get('/', optionalAuth, getBlogs)
router.get('/:slug', optionalAuth, getBlogBySlug)
router.post('/', protect, createBlog)
router.put('/:id', protect, blogOwner, updateBlog)
router.delete('/:id', protect, blogOwner, deleteBlog)
router.patch('/:id/view', incrementView)
router.patch('/:id/like', protect, toggleLike)

module.exports = router
