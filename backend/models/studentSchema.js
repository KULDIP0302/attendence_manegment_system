const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        // New students will set email, but older records may not have it.
        // Keep it optional and enforce uniqueness using a sparse index below.
    },
    rollNum: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    role: {
        type: String,
        default: "Student"
    },
    examResult: [
        {
            subName: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'subject',
            },
            marksObtained: {
                type: Number,
                default: 0
            }
        }
    ],
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['Present', 'Absent'],
            required: true
        },
        subName: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject',
            required: true
        }
    }]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Alias fields for frontend compatibility.
studentSchema.virtual('rollNumber')
    .get(function () { return this.rollNum; })
    .set(function (value) { this.rollNum = value; });

studentSchema.virtual('studentNumber')
    .get(function () { return this.rollNum; })
    .set(function (value) { this.rollNum = value; });

// Enforce uniqueness for new students per school (tenant).
// If email is missing on older documents, sparse=true prevents duplicate-index errors.
studentSchema.index({ email: 1, school: 1 }, { unique: true, sparse: true });

// Enforce roll number uniqueness per class (and per school/tenant).
studentSchema.index({ rollNum: 1, sclassName: 1, school: 1 }, { unique: true });

module.exports = mongoose.model("student", studentSchema);