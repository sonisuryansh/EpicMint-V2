const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            maxlength: [2000, 'Message cannot exceed 2000 characters'],
        },
        name: {
            type: String,
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        type: {
            type: String,
            enum: ['contact', 'report', 'feedback', 'support'],
            default: 'contact',
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'resolved'],
            default: 'pending',
        },
        ipAddress: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
)

submissionSchema.index({ status: 1 })
submissionSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Submission', submissionSchema)
