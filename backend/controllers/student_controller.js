const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const { signToken } = require('../utils/jwt');

const studentRegister = async (req, res) => {
    try {
        const { name, password, email, sclassName, rollNum } = req.body;
        const adminID = req.body.adminID;

        // Basic required fields validation
        if (!name || !password || !email || !sclassName || !adminID) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const normalizedName = String(name).trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const passwordLength = String(password).length;
        if (passwordLength < 6 || passwordLength > 10) {
            return res.status(400).json({ message: 'Password must be between 6 and 10 characters' });
        }

        // Prevent duplicate email within the same admin/school
        const existingEmailStudent = await Student.findOne({
            school: adminID,
            email: normalizedEmail,
        });
        if (existingEmailStudent) {
            return res.status(409).json({ message: 'Email already exists for this school' });
        }

        // Auto-generate 4-digit roll number by year and class (e.g. 2601, 2602...).
        // For backward compatibility, if rollNum is explicitly provided, prefer it.
        let parsedRollNum = Number(rollNum);
        if (!Number.isInteger(parsedRollNum) || parsedRollNum <= 0) {
            const yearPrefix = Number(String(new Date().getFullYear()).slice(-2));
            const start = yearPrefix * 100;
            const end = start + 99;

            const classStudents = await Student.find({
                school: adminID,
                sclassName,
                rollNum: { $gte: start, $lte: end },
            }, { rollNum: 1 }).lean();

            const maxInYear = classStudents.reduce((max, item) => Math.max(max, Number(item.rollNum) || 0), start);
            parsedRollNum = maxInYear + 1;

            if (parsedRollNum > end) {
                return res.status(400).json({ message: 'Roll number limit reached for this class in current year' });
            }
        }

        // Prevent duplicate roll number within same class and school.
        const existingRollNum = await Student.findOne({
            school: adminID,
            sclassName,
            rollNum: parsedRollNum,
        });
        if (existingRollNum) {
            return res.status(409).json({ message: 'Roll number already exists in this class' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const student = new Student({
            name: normalizedName,
            email: normalizedEmail,
            rollNum: parsedRollNum,
            password: hashedPass,
            sclassName,
            school: adminID,
        });

        let result = await student.save();
        result.password = undefined;

        // Return the created student so frontend can read rollNum if needed
        return res.send(result);
    } catch (err) {
        // Duplicate key fallback from DB unique index.
        if (err?.code === 11000) {
            if (err?.keyPattern?.rollNum) {
                return res.status(409).json({ message: 'Roll number already exists in this class' });
            }
            if (err?.keyPattern?.email) {
                return res.status(409).json({ message: 'Email already exists for this school' });
            }
        }
        return res.status(500).json(err);
    }
};

const studentLogIn = async (req, res) => {
    try {
        const { email, rollNum, identifier, password } = req.body;
        const loginIdentifier = String(identifier || email || rollNum || '').trim();

        if (!loginIdentifier || !password) {
            return res.send({ message: "Email/Roll Number and password are required" });
        }

        const isEmail = loginIdentifier.includes('@');
        const query = isEmail
            ? { email: loginIdentifier.toLowerCase() }
            : { rollNum: Number(loginIdentifier) };

        let student = await Student.findOne(query);
        if (student) {
            const validated = await bcrypt.compare(req.body.password, student.password);
            if (validated) {
                student = await student.populate("school", "schoolName")
                student = await student.populate("sclassName", "sclassName")
                student.password = undefined;
                student.examResult = undefined;
                student.attendance = undefined;
                const token = signToken({ id: student._id, role: student.role, school: student.school?._id });
                res.send({ ...student.toObject(), token });
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Student not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudents = async (req, res) => {
    try {
        let students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudentDetail = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .populate("examResult.subName", "subName")
            .populate("attendance.subName", "subName sessions");
        if (student) {
            student.password = undefined;
            res.send(student);
        }
        else {
            res.send({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const deleteStudent = async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id)
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const deleteStudents = async (req, res) => {
    try {
        const result = await Student.deleteMany({ school: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No students found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

const deleteStudentsByClass = async (req, res) => {
    try {
        const result = await Student.deleteMany({ sclassName: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No students found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

const updateStudent = async (req, res) => {
    try {
        if (req.body.password) {
            const passwordLength = String(req.body.password).length;
            if (passwordLength < 6 || passwordLength > 10) {
                return res.status(400).json({ message: 'Password must be between 6 and 10 characters' });
            }
            const salt = await bcrypt.genSalt(10)
            req.body.password = await bcrypt.hash(req.body.password, salt)
        }
        let result = await Student.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true })

        result.password = undefined;
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        const existingResult = student.examResult.find(
            (result) => result.subName.toString() === subName
        );

        if (existingResult) {
            existingResult.marksObtained = marksObtained;
        } else {
            student.examResult.push({ subName, marksObtained });
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const studentAttendance = async (req, res) => {
    const { subName, status, date } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        const subject = await Subject.findById(subName);

        const existingAttendance = student.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString() &&
                a.subName.toString() === subName
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            // Check if the student has already attended the maximum number of sessions
            const attendedSessions = student.attendance.filter(
                (a) => a.subName.toString() === subName
            ).length;

            if (attendedSessions >= subject.sessions) {
                return res.send({ message: 'Maximum attendance limit reached' });
            }

            student.attendance.push({ date, status, subName });
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
    const subName = req.params.id;

    try {
        const result = await Student.updateMany(
            { 'attendance.subName': subName },
            { $pull: { attendance: { subName } } }
        );
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendance = async (req, res) => {
    const schoolId = req.params.id

    try {
        const result = await Student.updateMany(
            { school: schoolId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const removeStudentAttendanceBySubject = async (req, res) => {
    const studentId = req.params.id;
    const subName = req.body.subId

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $pull: { attendance: { subName: subName } } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};


const removeStudentAttendance = async (req, res) => {
    const studentId = req.params.id;

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};


module.exports = {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,

    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
};