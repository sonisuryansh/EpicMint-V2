const express = require('express')
const router = express.Router()
const { generateBlogContent } = require('../controllers/blogAIController')
const { protect } = require('../middleware/auth')

router.post('/generate', protect, generateBlogContent)

module.exports = router
