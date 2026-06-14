const LeaveRequest = require('../models/leaveRequestSchema');
const Student = require('../models/studentSchema');
const Teacher = require('../models/teacherSchema');

const createLeaveRequest = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { date, fromDate, toDate, reason } = req.body;

        if (!reason) {
            return res.status(400).json({ message: 'reason is required' });
        }

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const classId = student.sclassName;
        const hasRange = Boolean(fromDate || toDate);
        let parsedDate = null;
        let parsedFromDate = null;
        let parsedToDate = null;

        if (hasRange) {
            if (!fromDate || !toDate) {
                return res.status(400).json({ message: 'Both fromDate and toDate are required for date range' });
            }
            parsedFromDate = new Date(fromDate);
            parsedToDate = new Date(toDate);
            if (Number.isNaN(parsedFromDate.getTime()) || Number.isNaN(parsedToDate.getTime())) {
                return res.status(400).json({ message: 'Invalid fromDate/toDate' });
            }
            if (parsedFromDate > parsedToDate) {
                return res.status(400).json({ message: 'fromDate cannot be after toDate' });
            }
            parsedDate = parsedFromDate;
        } else {
            parsedDate = new Date(date);
            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({ message: 'Invalid date' });
            }
        }

        const leave = new LeaveRequest({
            studentId,
            classId,
            date: parsedDate,
            fromDate: parsedFromDate,
            toDate: parsedToDate,
            reason,
        });

        const saved = await leave.save();
        return res.send(saved);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getStudentLeaveRequests = async (req, res) => {
    try {
        const studentId = req.user.id;
        const requests = await LeaveRequest.find({ studentId })
            .populate('classId', 'sclassName')
            .sort({ createdAt: -1 });
        return res.send(requests);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getTeacherLeaveRequests = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        const classId = teacher.teachSclass;
        const requests = await LeaveRequest.find({ classId })
            .populate('studentId', 'name rollNum')
            .sort({ date: -1, createdAt: -1 });

        return res.send(requests);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const decideLeaveRequest = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { requestId, status, teacherNote } = req.body;

        if (!requestId || !status) {
            return res.status(400).json({ message: 'requestId and status are required' });
        }
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'status must be Approved or Rejected' });
        }

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        const reqDoc = await LeaveRequest.findById(requestId);
        if (!reqDoc) return res.status(404).json({ message: 'Leave request not found' });

        if (String(reqDoc.classId) !== String(teacher.teachSclass)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Only allow decisions when still pending
        if (reqDoc.status !== 'Pending') {
            return res.status(400).json({ message: `Leave request already ${reqDoc.status}` });
        }

        reqDoc.status = status;
        reqDoc.teacherId = teacherId;
        reqDoc.teacherNote = teacherNote || reqDoc.teacherNote || '';

        const saved = await reqDoc.save();
        return res.send(saved);
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = {
    createLeaveRequest,
    getTeacherLeaveRequests,
    decideLeaveRequest,
    getStudentLeaveRequests,
};

