const Student = require('../models/studentSchema');
const Teacher = require('../models/teacherSchema');
const AttendanceRecord = require('../models/attendanceRecordSchema');

function parseMonthRange(monthParam) {
    const now = new Date();
    const fallback = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const raw = String(monthParam || fallback);
    const [yearStr, monthStr] = raw.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    if (!year || !month || month < 1 || month > 12) return null;
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    return { start, end, label: `${year}-${String(month).padStart(2, '0')}` };
}

function toPercentage(present, total) {
    if (!total) return 0;
    return Number(((present / total) * 100).toFixed(2));
}

const getTeacherClassReport = async (req, res) => {
    try {
        const requesterRole = String(req.user?.role || '').toLowerCase();
        const teacherId = req.user?.id;
        const { classId, month } = req.query;

        if (!classId) return res.status(400).json({ message: 'classId is required' });
        const range = parseMonthRange(month);
        if (!range) return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM' });

        const students = await Student.find({ sclassName: classId }, { _id: 1, name: 1, rollNum: 1 })
            .sort({ rollNum: 1 })
            .lean();

        // Teacher can only generate report for their assigned class.
        if (requesterRole === 'teacher') {
            if (!teacherId) return res.status(401).json({ message: 'Unauthorized' });
            const teacher = await Teacher.findById(teacherId, { teachSclass: 1 }).lean();
            if (!teacher || String(teacher.teachSclass) !== String(classId)) {
                return res.status(403).json({ message: 'You are not assigned to this class' });
            }
        }

        const attendanceRecords = await AttendanceRecord.find({
            classId,
            date: { $gte: range.start, $lt: range.end },
        })
            .populate('subjectId', 'subName')
            .lean();

        const studentMap = new Map(
            students.map((s) => [
                String(s._id),
                { studentId: s._id, name: s.name, rollNum: s.rollNum, present: 0, absent: 0, total: 0 },
            ])
        );

        let globalPresent = 0;
        let globalAbsent = 0;
        const subjectMap = new Map();

        for (const rec of attendanceRecords) {
            const subjectName = rec?.subjectId?.subName || 'Subject';
            const subjectAgg = subjectMap.get(subjectName) || { subject: subjectName, present: 0, absent: 0, total: 0 };

            for (const row of rec.students || []) {
                const key = String(row.studentId);
                if (!studentMap.has(key)) {
                    studentMap.set(key, {
                        studentId: row.studentId,
                        name: row.name,
                        rollNum: row.rollNo,
                        present: 0,
                        absent: 0,
                        total: 0,
                    });
                }

                const st = studentMap.get(key);
                st.total += 1;
                subjectAgg.total += 1;

                if (row.status === 'Present') {
                    st.present += 1;
                    subjectAgg.present += 1;
                    globalPresent += 1;
                } else if (row.status === 'Absent') {
                    st.absent += 1;
                    subjectAgg.absent += 1;
                    globalAbsent += 1;
                }
            }

            subjectMap.set(subjectName, subjectAgg);
        }

        const studentWiseAttendance = Array.from(studentMap.values())
            .map((s) => ({
                ...s,
                monthlyAttendancePercentage: toPercentage(s.present, s.total),
            }))
            .sort((a, b) => (Number(a.rollNum) || 0) - (Number(b.rollNum) || 0));

        const subjectWiseAttendance = Array.from(subjectMap.values())
            .map((s) => ({
                ...s,
                monthlyAttendancePercentage: toPercentage(s.present, s.total),
            }))
            .sort((a, b) => String(a.subject).localeCompare(String(b.subject)));

        const overallTotal = globalPresent + globalAbsent;

        return res.send({
            month: range.label,
            classId,
            totalStudents: students.length,
            presentCount: globalPresent,
            absentCount: globalAbsent,
            monthlyAttendancePercentage: toPercentage(globalPresent, overallTotal),
            subjectWiseAttendance,
            studentWiseAttendance,
        });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getStudentSelfReport = async (req, res) => {
    try {
        const studentId = req.user?.id;
        const requesterRole = String(req.user?.role || '').toLowerCase();
        const { month } = req.query;
        if (requesterRole !== 'student') return res.status(403).json({ message: 'Forbidden' });
        if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

        const range = parseMonthRange(month);
        if (!range) return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM' });

        const student = await Student.findById(studentId).populate('attendance.subName', 'subName').lean();
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const monthlyRows = (student.attendance || []).filter((a) => {
            const d = new Date(a.date);
            return d >= range.start && d < range.end;
        });

        let present = 0;
        let absent = 0;
        const subjectMap = new Map();
        for (const row of monthlyRows) {
            const subjectName = row?.subName?.subName || 'Subject';
            const current = subjectMap.get(subjectName) || { subject: subjectName, present: 0, absent: 0, total: 0 };
            current.total += 1;
            if (row.status === 'Present') {
                present += 1;
                current.present += 1;
            } else {
                absent += 1;
                current.absent += 1;
            }
            subjectMap.set(subjectName, current);
        }

        const total = present + absent;

        return res.send({
            month: range.label,
            studentId: student._id,
            name: student.name,
            rollNum: student.rollNum,
            presentCount: present,
            absentCount: absent,
            monthlyAttendancePercentage: toPercentage(present, total),
            subjectWiseAttendance: Array.from(subjectMap.values()).map((s) => ({
                ...s,
                monthlyAttendancePercentage: toPercentage(s.present, s.total),
            })),
        });
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = {
    getTeacherClassReport,
    getStudentSelfReport,
};
