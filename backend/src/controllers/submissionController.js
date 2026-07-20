const Submission = require('../models/Submission')
const { asyncHandler } = require('../middleware/errorHandler')

/**
 * POST /api/submissions
 */
const createSubmission = asyncHandler(async (req, res) => {
    const { email, message, name, type } = req.body

    if (!email || !message) {
        return res.status(400).json({ success: false, message: 'Email and message are required' })
    }

    const submission = await Submission.create({
        email,
        message,
        name: name || '',
        type: type || 'contact',
        ipAddress: req.ip,
    })

    res.status(201).json({
        success: true,
        message: 'Submission received! We will get back to you soon.',
        data: { id: submission._id },
    })
})

/**
 * GET /api/submissions — Admin only
 */
const getSubmissions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query
    const filter = {}
    if (status) filter.status = status

    const [submissions, total] = await Promise.all([
        Submission.find(filter)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit)),
        Submission.countDocuments(filter),
    ])

    res.json({
        success: true,
        data: submissions,
        pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    })
})

/**
 * PATCH /api/submissions/:id — Admin only
 */
const updateSubmissionStatus = asyncHandler(async (req, res) => {
    const { status } = req.body
    const submission = await Submission.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
    )
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' })
    res.json({ success: true, data: submission })
})

module.exports = { createSubmission, getSubmissions, updateSubmissionStatus }
