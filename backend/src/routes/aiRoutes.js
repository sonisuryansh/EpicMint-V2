const express = require('express')
const router = express.Router()
const {
    generateTitle,
    generateDescription,
    generateTags,
    generateAttributes,
    optimizePrompt,
    generateMetadata,
} = require('../controllers/aiController')
const { protect } = require('../middleware/auth')

// Secure AI endpoints with JWT authentication
router.use(protect)

router.post('/generate-title', generateTitle)
router.post('/generate-description', generateDescription)
router.post('/generate-tags', generateTags)
router.post('/generate-attributes', generateAttributes)
router.post('/optimize-prompt', optimizePrompt)
router.post('/generate-metadata', generateMetadata)

module.exports = router
