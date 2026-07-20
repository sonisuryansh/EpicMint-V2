const express = require('express')
const router = express.Router()
const { uploadImage, uploadMetadata } = require('../controllers/uploadController')

router.post('/image', uploadImage)
router.post('/metadata', uploadMetadata)

module.exports = router
