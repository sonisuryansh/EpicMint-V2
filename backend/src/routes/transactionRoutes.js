const express = require('express')
const router = Router = express.Router()
const { getTransactions, createTransaction } = require('../controllers/transactionController')
const { protect } = require('../middleware/auth')

// Public routes to view transaction logs
router.get('/:tokenId', getTransactions)

// Protected route to save a new log entry
router.post('/', protect, createTransaction)

module.exports = router
