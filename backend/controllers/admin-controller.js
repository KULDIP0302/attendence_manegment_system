const bcrypt = require('bcrypt');
const Admin = require('../models/adminSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Notice = require('../models/noticeSchema.js');
const Complain = require('../models/complainSchema.js');
const { signToken } = require('../utils/jwt');

// const adminRegister = async (req, res) => {
//     try {
//         const salt = await bcrypt.genSalt(10);
//         const hashedPass = await bcrypt.hash(req.body.password, salt);

//         const admin = new Admin({
//             ...req.body,
//             password: hashedPass
//         });

//         const existingAdminByEmail = await Admin.findOne({ email: req.body.email });
//         const existingSchool = await Admin.findOne({ schoolName: req.body.schoolName });

//         if (existingAdminByEmail) {
//             res.send({ message: 'Email already exists' });
//         }
//         else if (existingSchool) {
//             res.send({ message: 'School name already exists' });
//         }
//         else {
//             let result = await admin.save();
//             result.password = undefined;
//             res.send(result);
//         }
//     } catch (err) {
//         res.status(500).json(err);
//     }
// };

// const adminLogIn = async (req, res) => {
//     if (req.body.email && req.body.password) {
//         let admin = await Admin.findOne({ email: req.body.email });
//         if (admin) {
//             const validated = await bcrypt.compare(req.body.password, admin.password);
//             if (validated) {
//                 admin.password = undefined;
//                 res.send(admin);
//             } else {
//                 res.send({ message: "Invalid password" });
//             }
//         } else {
//             res.send({ message: "User not found" });
//         }
//     } else {
//         res.send({ message: "Email and password are required" });
//     }
// };

const adminRegister = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const admin = new Admin({
            ...req.body,
            password: hashedPass,
        });

        const existingAdminByEmail = await Admin.findOne({ email: req.body.email });
        const existingSchool = await Admin.findOne({ schoolName: req.body.schoolName });

        if (existingAdminByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else if (existingSchool) {
            res.send({ message: 'School name already exists' });
        }
        else {
            let result = await admin.save();
            result.password = undefined;
            const token = signToken({ id: result._id, role: result.role, school: result._id });
            res.send({ ...result.toObject(), token });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const adminLogIn = async (req, res) => {
    if (req.body.email && req.body.password) {
        const email = String(req.body.email).trim().toLowerCase();
        const inputPassword = String(req.body.password);
        let admin = await Admin.findOne({ email });
        if (!admin) return res.send({ message: "User not found" });

        const storedPassword = String(admin.password || '');
        if (!/^\$2[aby]\$\d{2}\$/.test(storedPassword)) {
            return res.status(400).send({
                message: "Password format is invalid. Please reset this account password from registration/update flow.",
            });
        }

        const validated = await bcrypt.compare(inputPassword, storedPassword);

        if (!validated) return res.send({ message: "Invalid password" });

        admin.password = undefined;
        const token = signToken({ id: admin._id, role: admin.role, school: admin._id });
        return res.send({ ...admin.toObject(), token });
    } else {
        res.send({ message: "Email and password are required" });
    }
};

const getAdminDetail = async (req, res) => {
    try {
        let admin = await Admin.findById(req.params.id);
        if (admin) {
            admin.password = undefined;
            res.send(admin);
        }
        else {
            res.send({ message: "No admin found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const result = await Admin.findByIdAndDelete(req.params.id);

        await Sclass.deleteMany({ school: req.params.id });
        await Student.deleteMany({ school: req.params.id });
        await Teacher.deleteMany({ school: req.params.id });
        await Subject.deleteMany({ school: req.params.id });
        await Notice.deleteMany({ school: req.params.id });
        await Complain.deleteMany({ school: req.params.id });

        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const updateAdmin = async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        let result = await Admin.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true },
        );

        if (result) {
            result.password = undefined;
        }
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { adminRegister, adminLogIn, getAdminDetail, deleteAdmin, updateAdmin };

//module.exports = { adminRegister, adminLogIn, getAdminDetail };
