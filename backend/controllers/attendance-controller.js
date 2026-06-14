const Attendance = require('../models/attendanceSchema');
const Student = require('../models/studentSchema');

function normalizeDateOnly(dateInput) {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return null;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Teacher marks attendance for a whole class+subject on a date
// body: { classId, subjectId, date, records: [{ studentId, status }] }
const markAttendanceBulk = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { classId, subjectId, date, records } = req.body;

        if (!classId || !subjectId || !date || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ message: 'classId, subjectId, date, records are required' });
        }

        const normalizedDate = normalizeDateOnly(date);
        if (!normalizedDate) return res.status(400).json({ message: 'Invalid date' });

        const docs = records.map((r) => ({
            studentId: r.studentId,
            classId,
            subjectId,
            teacherId,
            date: normalizedDate,
            status: r.status,
        }));

        // Prevent duplicates (unique index) and also give a friendly error
        try {
            const result = await Attendance.insertMany(docs, { ordered: false });
            return res.send({ inserted: result.length });
        } catch (e) {
            // If duplicates exist, Mongo will throw. We still want to tell client.
            if (e && (e.code === 11000 || String(e.message || '').includes('E11000'))) {
                return res.status(409).json({ message: 'Attendance already marked for one or more students (same date & subject)' });
            }
            throw e;
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

// Student view attendance (optionally by month)
// query: ?month=1-12&year=YYYY&subjectId=...
const getStudentAttendance = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const { month, year, subjectId } = req.query;

        const filter = { studentId };
        if (subjectId) filter.subjectId = subjectId;

        if (month && year) {
            const m = Number(month) - 1;
            const y = Number(year);
            const start = new Date(Date.UTC(y, m, 1));
            const end = new Date(Date.UTC(y, m + 1, 1));
            filter.date = { $gte: start, $lt: end };
        }

        const rows = await Attendance.find(filter)
            .populate('subjectId', 'subName sessions')
            .sort({ date: 1 });

        return res.send(rows);
    } catch (error) {
        return res.status(500).json(error);
    }
};

// Teacher monthly report for a class+subject
// query: ?classId=...&subjectId=...&month=1-12&year=YYYY
const teacherMonthlyReport = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { classId, subjectId, month, year } = req.query;

        if (!classId || !subjectId || !month || !year) {
            return res.status(400).json({ message: 'classId, subjectId, month, year are required' });
        }

        const m = Number(month) - 1;
        const y = Number(year);
        const start = new Date(Date.UTC(y, m, 1));
        const end = new Date(Date.UTC(y, m + 1, 1));

        const rows = await Attendance.find({
            teacherId,
            classId,
            subjectId,
            date: { $gte: start, $lt: end },
        }).lean();

        // Aggregate per student
        const byStudent = new Map();
        for (const r of rows) {
            const key = String(r.studentId);
            const cur = byStudent.get(key) || { studentId: r.studentId, present: 0, absent: 0, total: 0 };
            cur.total += 1;
            if (r.status === 'Present') cur.present += 1;
            else cur.absent += 1;
            byStudent.set(key, cur);
        }

        const studentIds = Array.from(byStudent.values()).map((x) => x.studentId);
        const students = await Student.find({ _id: { $in: studentIds } }, { name: 1, rollNum: 1 }).lean();
        const studentMap = new Map(students.map((s) => [String(s._id), s]));

        const report = Array.from(byStudent.values()).map((r) => {
            const s = studentMap.get(String(r.studentId));
            const percentage = r.total === 0 ? 0 : (r.present / r.total) * 100;
            return {
                studentId: r.studentId,
                name: s?.name,
                rollNum: s?.rollNum,
                present: r.present,
                absent: r.absent,
                total: r.total,
                percentage,
            };
        });

        return res.send(report);
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = {
    markAttendanceBulk,
    getStudentAttendance,
    teacherMonthlyReport,
};

