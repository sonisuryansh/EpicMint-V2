const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/epicmint'
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        })
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`)
        // Retry after 5 seconds instead of crashing
        console.log('Retrying connection in 5 seconds...')
        setTimeout(connectDB, 5000)
    }
}

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...')
})

module.exports = connectDB
