const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const { asyncHandler } = require('../middleware/errorHandler')
const pinataService = require('../services/pinataService')

// Ensure temporary uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

// Temporary Multer disk storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, `tmp-${uniqueSuffix}${path.extname(file.originalname)}`)
    },
})

// File validation: jpg, jpeg, png, webp
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '')
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp']

    if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
        cb(null, true)
    } else {
        cb(new Error('Invalid image format. Only JPG, JPEG, PNG, and WebP are allowed.'), false)
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB upper boundary before compression
})

/**
 * POST /api/uploads/image
 * Upload image to Pinata IPFS after optional Sharp compression, then delete temporary file.
 */
const uploadImage = [
    upload.single('file'),
    asyncHandler(async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' })
        }

        const filePath = req.file.path
        let pinataData

        try {
            const stats = await fs.promises.stat(filePath)
            const MAX_ONE_MB = 1024 * 1024

            if (stats.size > MAX_ONE_MB) {
                console.log(`⚡ Image size (${stats.size} bytes) exceeds 1MB. Auto-compressing with Sharp...`)
                const compressedBuffer = await sharp(filePath)
                    .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 80 })
                    .toBuffer()

                pinataData = await pinataService.uploadImage(compressedBuffer, req.file.originalname)
            } else {
                pinataData = await pinataService.uploadImage(filePath, req.file.originalname)
            }

            return res.status(201).json({
                success: true,
                data: {
                    image: pinataData.image,
                    gatewayUrl: pinataData.gatewayUrl,
                    ipfsCID: pinataData.ipfsCID,
                    url: pinataData.gatewayUrl,
                    ipfsHash: pinataData.ipfsCID,
                    ipfsUrl: pinataData.image,
                    originalName: req.file.originalname,
                    size: stats.size,
                    mimetype: req.file.mimetype,
                },
            })
        } finally {
            // ALWAYS delete local temporary file, whether upload succeeds or fails
            try {
                if (fs.existsSync(filePath)) {
                    await fs.promises.unlink(filePath)
                    console.log('🗑️ Local temporary file deleted:', filePath)
                }
            } catch (unlinkErr) {
                console.error('Error deleting temporary file:', unlinkErr.message)
            }
        }
    }),
]

/**
 * POST /api/uploads/metadata
 * Upload NFT metadata JSON object to Pinata IPFS
 */
const uploadMetadata = asyncHandler(async (req, res) => {
    const { name, description, image, attributes, external_url, properties } = req.body

    if (!name || !description || !image) {
        return res.status(400).json({
            success: false,
            message: 'name, description, and image are required',
        })
    }

    const metadataObj = { name, description, image, attributes: attributes || [], external_url, properties }
    const pinataData = await pinataService.uploadMetadata(metadataObj)

    res.status(201).json({
        success: true,
        data: {
            metadataCID: pinataData.metadataCID,
            tokenURI: pinataData.tokenURI,
            ipfsHash: pinataData.metadataCID,
            ipfsUrl: pinataData.tokenURI,
            metadata: metadataObj,
        },
    })
})

module.exports = {
    uploadImage,
    uploadMetadata,
}
