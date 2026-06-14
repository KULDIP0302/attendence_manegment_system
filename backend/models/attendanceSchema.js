const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true,
        index: true,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true,
        index: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true,
    },
}, { timestamps: true });

attendanceSchema.index(
    { studentId: 1, subjectId: 1, date: 1 },
    { unique: true },
);

module.exports = mongoose.model('attendance', attendanceSchema);

