require('dns').setServers(['8.8.8.8', '8.8.4.4']) // bypass ISP DNS which blocks SRV records
require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')

const connectDB = require('./config/db')
const { errorHandler, notFound } = require('./middleware/errorHandler')

// Import routes
const authRoutes = require('./routes/authRoutes')
const nftRoutes = require('./routes/nftRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const submissionRoutes = require('./routes/submissionRoutes')
const aiRoutes = require('./routes/aiRoutes')
const commentRoutes = require('./routes/commentRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const blogRoutes = require('./routes/blogRoutes')
const blogAIRoutes = require('./routes/blogAIRoutes')

const app = express()
const PORT = process.env.PORT || 5000

// ============ CONNECT DATABASE ============
connectDB()

// ============ SECURITY MIDDLEWARE ============
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving uploaded images
}))

// CORS — restrict to known origins
// FRONTEND_URL can be comma-separated: "https://a.vercel.app,https://b.vercel.app"
const allowedOrigins = [
    ...(process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map(u => u.trim().replace(/\/$/, ''))
        : ['http://localhost:3000']),
    'http://localhost:3001',
    'http://localhost:5173',
]

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true)
        // Trim trailing slash from incoming origin before comparing
        const normalizedOrigin = origin.replace(/\/$/, '')
        if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true)
        console.warn(`CORS blocked: ${origin} | Allowed: ${allowedOrigins.join(', ')}`)
        callback(new Error(`CORS: Origin ${origin} not allowed`))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200, // Some browsers send OPTIONS preflight
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions)) // Handle preflight for all routes

// ============ RATE LIMITING ============
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests — please try again in 15 minutes.' },
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many auth requests — please try again later.' },
})

app.use(globalLimiter)

// ============ BODY PARSING ============
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ============ LOGGING ============
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// ============ STATIC FILES ============
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
    const mongoose = require('mongoose')
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV || 'development',
        version: '2.0.0',
    })
})

// ============ API ROUTES ============
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/nfts', nftRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/support', require('./routes/supportRoutes'))
app.use('/api/blogs', blogRoutes)
app.use('/api/blog-ai', blogAIRoutes)

// Serve static frontend build in production if hosted on same Express instance
if (process.env.NODE_ENV === 'production') {
    const frontendDist = path.join(__dirname, '../../frontend/dist')
    if (fs.existsSync(frontendDist)) {
        app.use(express.static(frontendDist))
        app.get('*', (req, res, next) => {
            if (req.path.startsWith('/api')) return next()
            res.sendFile(path.join(frontendDist, 'index.html'))
        })
    }
}

// ============ ERROR HANDLING ============
app.use(notFound)
app.use(errorHandler)

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log(`\n🚀 EpicMint Backend v2.0 running on port ${PORT}`)
    console.log(`📍 Health check: http://localhost:${PORT}/health`)
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔗 CORS Origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n`)
})

module.exports = app
