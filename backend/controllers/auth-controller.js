const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema');
const { signToken } = require('../utils/jwt');

const login = async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        const role = String(req.body.role || 'teacher').trim().toLowerCase();

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // This endpoint is for teacher authentication flow.
        if (role !== 'teacher') {
            return res.status(400).json({ message: 'Only teacher login is supported on this endpoint' });
        }

        let teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const isValid = await bcrypt.compare(password, teacher.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        if (String(teacher.role || '').toLowerCase() !== 'teacher') {
            return res.status(403).json({ message: 'User is not a teacher' });
        }

        teacher = await teacher.populate('teachSubject', 'subName sessions');
        teacher = await teacher.populate('school', 'schoolName');
        teacher = await teacher.populate('teachSclass', 'sclassName');

        teacher.password = undefined;
        const token = signToken({ id: teacher._id, role: teacher.role, school: teacher.school?._id });

        return res.send({ ...teacher.toObject(), token });
    } catch (error) {
        return res.status(500).json({ message: 'Login failed', error: String(error?.message || error) });
    }
};

module.exports = { login };

