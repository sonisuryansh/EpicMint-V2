const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { createSupportTicket, getSupportTickets } = require('../controllers/supportController')

// Temp storage for support ticket attachments
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, 'support-' + uniqueSuffix + path.extname(file.originalname))
    },
})

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max limit
})

router.post('/', upload.single('attachment'), createSupportTicket)
router.get('/', getSupportTickets)

module.exports = router
