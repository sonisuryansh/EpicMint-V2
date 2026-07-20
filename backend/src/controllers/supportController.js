const { asyncHandler } = require('../middleware/errorHandler')
const SupportTicket = require('../models/SupportTicket')

/**
 * POST /api/support
 * Submit a customer support ticket
 */
const createSupportTicket = asyncHandler(async (req, res) => {
    const { name, email, walletAddress, subject, category, message } = req.body

    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: 'Please fill in all required fields (Name, Email, Subject, Message)',
        })
    }

    let attachmentUrl = ''
    if (req.file) {
        attachmentUrl = `/uploads/${req.file.filename}`
    }

    const ticket = await SupportTicket.create({
        name,
        email,
        walletAddress: walletAddress || '',
        subject,
        category: category || 'General Question',
        message,
        attachment: attachmentUrl,
    })

    res.status(201).json({
        success: true,
        message: 'Support ticket submitted successfully! Our team will get back to you shortly.',
        ticket,
    })
})

/**
 * GET /api/support
 * List support tickets
 */
const getSupportTickets = asyncHandler(async (req, res) => {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 })
    res.json({ success: true, tickets })
})

module.exports = {
    createSupportTicket,
    getSupportTickets,
}
