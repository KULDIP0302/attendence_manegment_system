const LeaveRequest = require('../models/leaveRequestSchema');
const Teacher = require('../models/teacherSchema');
const Student = require('../models/studentSchema');
const AttendanceRecord = require('../models/attendanceRecordSchema');

function normalizeDateOnly(dateInput) {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return null;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

const getLeaveRequests = async (req, res) => {
    try {
        const teacherId = req.user?.id;
        const teacher = await Teacher.findById(teacherId).lean();
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        const rows = await LeaveRequest.find({ classId: teacher.teachSclass })
            .populate('studentId', 'name rollNum')
            .populate('classId', 'sclassName')
            .sort({ date: -1, createdAt: -1 });

        return res.send(rows);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const updateLeaveRequestStatus = async (req, res) => {
    try {
        const teacherId = req.user?.id;
        const requestId = req.params.id;
        const { status } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'status must be Approved or Rejected' });
        }

        const teacher = await Teacher.findById(teacherId).lean();
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        const leave = await LeaveRequest.findById(requestId);
        if (!leave) return res.status(404).json({ message: 'Leave request not found' });
        if (String(leave.classId) !== String(teacher.teachSclass)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        leave.status = status;
        leave.teacherId = teacherId;
        await leave.save();

        // If approved, mark that student's attendance as Leave for same date.
        if (status === 'Approved') {
            const normalizedDate = normalizeDateOnly(leave.date);
            const student = await Student.findById(leave.studentId, { _id: 1, rollNum: 1, name: 1 }).lean();
            if (normalizedDate && student) {
                let record = await AttendanceRecord.findOne({ classId: leave.classId, date: normalizedDate });
                if (!record) {
                    record = await AttendanceRecord.create({
                        classId: leave.classId,
                        date: normalizedDate,
                        students: [{ studentId: student._id, rollNo: student.rollNum, name: student.name, status: 'Leave' }],
                    });
                } else {
                    const idx = (record.students || []).findIndex((s) => String(s.studentId) === String(student._id));
                    if (idx >= 0) record.students[idx].status = 'Leave';
                    else record.students.push({ studentId: student._id, rollNo: student.rollNum, name: student.name, status: 'Leave' });
                    await record.save();
                }
            }
        }

        return res.send({ message: 'Leave request updated successfully', leave });
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = {
    getLeaveRequests,
    updateLeaveRequestStatus,
};

