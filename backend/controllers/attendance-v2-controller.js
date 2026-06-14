const AttendanceRecord = require('../models/attendanceRecordSchema');
const Student = require('../models/studentSchema');
const Teacher = require('../models/teacherSchema');
const Sclass = require('../models/sclassSchema');
const mongoose = require('mongoose');

function normalizeDateOnly(dateInput) {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return null;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function parseMonthRange(monthParam, yearParam) {
    if (!monthParam) return null;

    // Supports "YYYY-MM" or month=1..12 + optional year.
    if (String(monthParam).includes('-')) {
        const [y, m] = String(monthParam).split('-').map(Number);
        if (!y || !m || m < 1 || m > 12) return null;
        const start = new Date(Date.UTC(y, m - 1, 1));
        const end = new Date(Date.UTC(y, m, 1));
        return { start, end };
    }

    const m = Number(monthParam);
    const y = Number(yearParam) || new Date().getUTCFullYear();
    if (!m || m < 1 || m > 12 || !y) return null;

    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 1));
    return { start, end };
}

const markAttendance = async (req, res) => {
    try {
        const teacherId = req.user?.id;
        const { classId, date, students, subjectId } = req.body;

        if (!teacherId || !classId || !date || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ message: 'classId, date, students are required' });
        }

        const teacher = await Teacher.findById(teacherId).lean();
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        // Teacher replacement support:
        // Any teacher from same school can temporarily mark attendance for a class.
        const targetClass = await Sclass.findById(classId, { _id: 1, school: 1 }).lean();
        if (!targetClass) return res.status(404).json({ message: 'Class not found' });
        if (String(targetClass.school) !== String(teacher.school)) {
            return res.status(403).json({ message: 'You can only mark attendance for classes in your school' });
        }

        const normalizedDate = normalizeDateOnly(date);
        if (!normalizedDate) return res.status(400).json({ message: 'Invalid date' });
        const teacherSubjectId = teacher?.teachSubject || null;
        const effectiveSubjectId = subjectId || teacherSubjectId || null;

        const ids = students.map((s) => s.studentId).filter(Boolean);
        const classStudents = await Student.find({ _id: { $in: ids }, sclassName: classId }, { _id: 1, rollNum: 1, name: 1 }).lean();
        const studentMap = new Map(classStudents.map((s) => [String(s._id), s]));

        const normalizedStudents = [];
        for (const row of students) {
            const student = studentMap.get(String(row.studentId));
            if (!student) continue;

            const status = row.status === 'Present' || row.status === 'Leave' ? row.status : 'Absent';
            normalizedStudents.push({
                studentId: student._id,
                rollNo: student.rollNum,
                name: student.name,
                status,
            });
        }

        if (normalizedStudents.length === 0) {
            return res.status(400).json({ message: 'No valid students provided for this class' });
        }

        let attendance = await AttendanceRecord.findOne({ classId, date: normalizedDate, subjectId: effectiveSubjectId });
        if (!attendance) {
            attendance = await AttendanceRecord.create({
                classId,
                subjectId: effectiveSubjectId,
                date: normalizedDate,
                students: normalizedStudents,
            });
            return res.send({ message: 'Attendance saved successfully', attendance });
        }

        // Allow re-marking / updating for late students:
        // - If student already exists for this class+date+subject, update status.
        // - If student doesn't exist, append.
        const existingIndexByStudentId = new Map(
            (attendance.students || []).map((s, idx) => [String(s.studentId), idx])
        );

        for (const s of normalizedStudents) {
            const idx = existingIndexByStudentId.get(String(s.studentId));
            if (idx === undefined) {
                attendance.students.push(s);
            } else {
                attendance.students[idx].status = s.status;
                // keep roll/name in sync (in case of changes)
                attendance.students[idx].rollNo = s.rollNo;
                attendance.students[idx].name = s.name;
            }
        }
        await attendance.save();
        return res.send({ message: 'Attendance saved successfully', attendance });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getStudentAttendanceHistory = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        if (!studentId) return res.status(400).json({ message: 'studentId is required' });
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: 'Invalid studentId' });
        }
        if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });

        const requesterRole = String(req.user.role || '').toLowerCase();
        const isSelfStudentRequest = requesterRole === 'student' && String(req.user.id) === String(studentId);
        const isPrivileged = requesterRole === 'admin' || requesterRole === 'teacher';
        if (!isSelfStudentRequest && !isPrivileged) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const records = await AttendanceRecord.find(
            { 'students.studentId': studentId },
            { date: 1, classId: 1, subjectId: 1, students: 1 }
        )
            .populate('subjectId', 'subName')
            .sort({ date: -1 })
            .lean();

        const student = await Student.findById(studentId)
            .populate('attendance.subName', 'subName')
            .lean();

        const toDayKey = (value) => {
            const d = new Date(value);
            if (Number.isNaN(d.getTime())) return '';
            return d.toISOString().slice(0, 10);
        };

        const legacyRows = (student?.attendance || []).map((a) => ({
            date: a.date,
            status: a.status,
            subject: a?.subName?.subName || 'Subject',
            classId: student?.sclassName,
        }));

        // Map known subject names by day + status so v2 rows don't show "Class Attendance".
        const legacySubjectByDayAndStatus = new Map(
            legacyRows.map((row) => [`${toDayKey(row.date)}::${row.status}`, row.subject])
        );

        const v2Rows = records.map((r) => {
            const studentRow = (r.students || []).find((s) => String(s.studentId) === String(studentId));
            const status = studentRow?.status || 'Absent';
            const key = `${toDayKey(r.date)}::${status}`;
            return {
                date: r.date,
                status,
                subject: r?.subjectId?.subName || legacySubjectByDayAndStatus.get(key) || 'Subject',
                classId: r.classId,
            };
        });

        // Prefer legacy rows (they carry real subject names) and only add unmatched v2 rows.
        const legacyKeys = new Set(
            legacyRows.map((row) => `${toDayKey(row.date)}::${row.status}`)
        );
        const unmatchedV2Rows = v2Rows.filter(
            (row) => !legacyKeys.has(`${toDayKey(row.date)}::${row.status}`)
        );

        const rows = [...legacyRows, ...unmatchedV2Rows]
            .filter((r) => r.date)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return res.send(rows);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getClassAttendanceByDate = async (req, res) => {
    try {
        const classId = req.params.classId;
        const date = req.query.date;
        const subjectId = req.query.subjectId;
        if (!classId || !date) return res.status(400).json({ message: 'classId and date are required' });

        const normalizedDate = normalizeDateOnly(date);
        if (!normalizedDate) return res.status(400).json({ message: 'Invalid date' });

        if (subjectId) {
            const attendance = await AttendanceRecord.findOne({ classId, date: normalizedDate, subjectId }).lean();
            if (!attendance) return res.send({ classId, date: normalizedDate, subjectId, students: [] });
            const summary = attendance.students.reduce(
                (acc, s) => {
                    acc.total += 1;
                    if (s.status === 'Present') acc.present += 1;
                    else if (s.status === 'Leave') acc.leave += 1;
                    else acc.absent += 1;
                    return acc;
                },
                { total: 0, present: 0, absent: 0, leave: 0 }
            );
            return res.send({ ...attendance, summary });
        }

        const attendances = await AttendanceRecord.find({ classId, date: normalizedDate }).lean();
        if (!attendances.length) return res.send({ classId, date: normalizedDate, students: [], summary: { total: 0, present: 0, absent: 0, leave: 0 } });

        const students = attendances.flatMap((a) => a.students || []);
        const summary = students.reduce(
            (acc, s) => {
                acc.total += 1;
                if (s.status === 'Present') acc.present += 1;
                else if (s.status === 'Leave') acc.leave += 1;
                else acc.absent += 1;
                return acc;
            },
            { total: 0, present: 0, absent: 0, leave: 0 }
        );
        return res.send({ classId, date: normalizedDate, students, summary });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getMonthlyReportByClass = async (req, res) => {
    try {
        const classId = req.params.classId;
        const month = req.query.month;
        const year = req.query.year;
        const subjectId = req.query.subjectId;
        if (!classId || !month) return res.status(400).json({ message: 'classId and month are required' });

        const range = parseMonthRange(month, year);
        if (!range) return res.status(400).json({ message: 'Invalid month/year' });

        const filter = {
            classId,
            date: { $gte: range.start, $lt: range.end },
        };
        if (subjectId) filter.subjectId = subjectId;

        const records = await AttendanceRecord.find(filter).lean();

        const studentAgg = new Map();
        for (const rec of records) {
            for (const s of rec.students || []) {
                const key = String(s.studentId);
                if (!studentAgg.has(key)) {
                    studentAgg.set(key, { studentId: s.studentId, name: s.name, present: 0, absent: 0, leave: 0, total: 0 });
                }
                const row = studentAgg.get(key);
                row.total += 1;
                if (s.status === 'Present') row.present += 1;
                else if (s.status === 'Leave') row.leave += 1;
                else row.absent += 1;
            }
        }

        const report = Array.from(studentAgg.values()).map((r) => ({
            studentId: r.studentId,
            name: r.name,
            totalPresent: r.present,
            totalAbsent: r.absent,
            totalLeave: r.leave,
            attendancePercentage: r.total === 0 ? 0 : (r.present / r.total) * 100,
        }));

        return res.send(report);
    } catch (error) {
        return res.status(500).json(error);
    }
};

// Alias API: GET /students?classId=...
const getStudentsByClass = async (req, res) => {
    try {
        const classId = req.query.classId;
        if (!classId) return res.status(400).json({ message: 'classId is required' });

        const rows = await Student.find({ sclassName: classId }, { _id: 1, rollNum: 1, name: 1, sclassName: 1 }).sort({ rollNum: 1 }).lean();
        return res.send(rows);
    } catch (error) {
        return res.status(500).json(error);
    }
};

// Alias API: GET /attendance?classId=...&date=...
const getAttendanceByQuery = async (req, res) => {
    try {
        const classId = req.query.classId;
        const date = req.query.date;
        const subjectId = req.query.subjectId;
        if (!classId || !date) return res.status(400).json({ message: 'classId and date are required' });

        const normalizedDate = normalizeDateOnly(date);
        if (!normalizedDate) return res.status(400).json({ message: 'Invalid date' });

        if (subjectId) {
            const attendance = await AttendanceRecord.findOne({ classId, date: normalizedDate, subjectId }).lean();
            if (!attendance) return res.send({ classId, date: normalizedDate, subjectId, students: [] });
            const summary = attendance.students.reduce(
                (acc, s) => {
                    acc.total += 1;
                    if (s.status === 'Present') acc.present += 1;
                    else if (s.status === 'Leave') acc.leave += 1;
                    else acc.absent += 1;
                    return acc;
                },
                { total: 0, present: 0, absent: 0, leave: 0 }
            );
            return res.send({ ...attendance, summary });
        }

        const attendances = await AttendanceRecord.find({ classId, date: normalizedDate }).lean();
        if (!attendances.length) return res.send({ classId, date: normalizedDate, students: [] });
        const students = attendances.flatMap((a) => a.students || []);
        const summary = students.reduce(
            (acc, s) => {
                acc.total += 1;
                if (s.status === 'Present') acc.present += 1;
                else if (s.status === 'Leave') acc.leave += 1;
                else acc.absent += 1;
                return acc;
            },
            { total: 0, present: 0, absent: 0, leave: 0 }
        );
        return res.send({ classId, date: normalizedDate, students, summary });
    } catch (error) {
        return res.status(500).json(error);
    }
};

// Admin summary support: total attendance records by school
const getAttendanceRecordCountBySchool = async (req, res) => {
    try {
        const schoolId = req.params.schoolId;
        if (!schoolId) return res.status(400).json({ message: 'schoolId is required' });

        const classes = await Sclass.find({ school: schoolId }, { _id: 1 }).lean();
        const classIds = classes.map((c) => c._id);

        if (classIds.length === 0) {
            return res.send({ totalAttendanceRecords: 0 });
        }

        const totalAttendanceRecords = await AttendanceRecord.countDocuments({ classId: { $in: classIds } });
        return res.send({ totalAttendanceRecords });
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = {
    markAttendance,
    getClassAttendanceByDate,
    getMonthlyReportByClass,
    getStudentsByClass,
    getAttendanceByQuery,
    getAttendanceRecordCountBySchool,
    getStudentAttendanceHistory,
};

