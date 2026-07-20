const express = require('express')
const router = express.Router()
const {
    createSubmission,
    getSubmissions,
    updateSubmissionStatus,
} = require('../controllers/submissionController')
const { protect, authorize } = require('../middleware/auth')

router.post('/', createSubmission)
router.get('/', protect, authorize('admin'), getSubmissions)
router.patch('/:id', protect, authorize('admin'), updateSubmissionStatus)

module.exports = router
