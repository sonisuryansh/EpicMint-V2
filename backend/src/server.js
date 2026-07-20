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

const app = express()
const PORT = process.env.PORT || 5000

// ============ CONNECT DATABASE ============
connectDB()

// ============ SECURITY MIDDLEWARE ============
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving uploaded images
}))

// CORS — restrict to known origins
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
]

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)
        callback(new Error(`CORS: Origin ${origin} not allowed`))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}))

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
