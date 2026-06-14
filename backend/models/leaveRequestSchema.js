const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true,
        index: true,
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
        index: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    fromDate: {
        type: Date,
        default: null,
    },
    toDate: {
        type: Date,
        default: null,
    },
    reason: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
        index: true,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        default: null,
    },
    teacherNote: {
        type: String,
        default: '',
        trim: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('leave_request', leaveRequestSchema);

