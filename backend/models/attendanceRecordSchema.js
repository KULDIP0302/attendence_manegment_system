const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sclass',
            required: true,
            index: true,
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject',
            default: null,
            index: true,
        },
        date: {
            type: Date,
            required: true,
            index: true,
        },
        students: [
            {
                studentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'student',
                    required: true,
                },
                rollNo: {
                    type: Number,
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },
                status: {
                    type: String,
                    enum: ['Present', 'Absent', 'Leave'],
                    required: true,
                    default: 'Absent',
                },
            },
        ],
    },
    { timestamps: true }
);

attendanceRecordSchema.index({ classId: 1, date: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('attendance_record', attendanceRecordSchema);

