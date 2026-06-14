const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Student = require('../models/studentSchema.js');

const subjectCreate = async (req, res) => {
    try {
        const subjects = req.body.subjects.map((subject) => ({
            subName: subject.subName,
            sessions: subject.sessions,
        }));

        // OPTIONAL: Duplicate subject name check (per class)
        const existingSubject = await Subject.findOne({
            subName: subjects[0].subName,
            sclassName: req.body.sclassName,
            school: req.body.adminID,
        });

        if (existingSubject) {
            return res.send({ message: 'Subject already exists in this class' });
        }

        const newSubjects = subjects.map((subject) => ({
            ...subject,
            sclassName: req.body.sclassName,
            school: req.body.adminID,
        }));

        const result = await Subject.insertMany(newSubjects);
        res.send(result);

    } catch (err) {
        res.status(500).json(err);
    }
};

const allSubjects = async (req, res) => {
    try {
        let subjects = await Subject.find({ school: req.params.id })
            .populate("sclassName", "sclassName");

        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const classSubjects = async (req, res) => {
    try {
        let subjects = await Subject.find({ sclassName: req.params.id });

        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const freeSubjectList = async (req, res) => {
    try {
        let subjects = await Subject.find({
            sclassName: req.params.id,
            teacher: { $exists: false }
        });

        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getSubjectDetail = async (req, res) => {
    try {
        let subject = await Subject.findById(req.params.id);

        if (subject) {
            subject = await subject.populate("sclassName", "sclassName");
            subject = await subject.populate("teacher", "name");
            res.send(subject);
        } else {
            res.send({ message: "No subject found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateSubject = async (req, res) => {
    try {
        const { subName, sclassName, teacher } = req.body;
        if (!subName || !sclassName) {
            return res.status(400).json({ message: "subName and sclassName are required" });
        }

        const existingSubject = await Subject.findById(req.params.id);
        if (!existingSubject) {
            return res.status(404).json({ message: "No subject found" });
        }

        const previousTeacherId = existingSubject.teacher ? String(existingSubject.teacher) : null;
        const nextTeacherId = teacher ? String(teacher) : null;

        existingSubject.subName = subName;
        existingSubject.sclassName = sclassName;
        existingSubject.teacher = teacher || undefined;

        const updatedSubject = await existingSubject.save();

        // Keep teacher-subject relation consistent.
        if (previousTeacherId && previousTeacherId !== nextTeacherId) {
            await Teacher.updateOne(
                { _id: previousTeacherId, teachSubject: updatedSubject._id },
                { $unset: { teachSubject: "" } }
            );
        }

        if (nextTeacherId) {
            await Teacher.updateOne(
                { _id: nextTeacherId },
                { $set: { teachSubject: updatedSubject._id, teachSclass: sclassName } }
            );
        }

        const populated = await Subject.findById(updatedSubject._id)
            .populate("sclassName", "sclassName")
            .populate("teacher", "name");

        return res.send(populated);
    } catch (err) {
        return res.status(500).json(err);
    }
};

const deleteSubject = async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

        await Teacher.updateOne(
            { teachSubject: deletedSubject._id },
            { $unset: { teachSubject: "" } }
        );

        await Student.updateMany(
            {},
            { $pull: { examResult: { subName: deletedSubject._id } } }
        );

        await Student.updateMany(
            {},
            { $pull: { attendance: { subName: deletedSubject._id } } }
        );

        res.send(deletedSubject);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ school: req.params.id });
        const subjectIds = subjects.map(s => s._id);

        await Subject.deleteMany({ school: req.params.id });

        await Teacher.updateMany(
            { teachSubject: { $in: subjectIds } },
            { $unset: { teachSubject: "" } }
        );

        await Student.updateMany(
            {},
            { $set: { examResult: null, attendance: null } }
        );

        res.send({ message: "All subjects deleted" });
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteSubjectsByClass = async (req, res) => {
    try {
        const subjects = await Subject.find({ sclassName: req.params.id });
        const subjectIds = subjects.map(s => s._id);

        await Subject.deleteMany({ sclassName: req.params.id });

        await Teacher.updateMany(
            { teachSubject: { $in: subjectIds } },
            { $unset: { teachSubject: "" } }
        );

        await Student.updateMany(
            {},
            { $set: { examResult: null, attendance: null } }
        );

        res.send({ message: "Class subjects deleted" });
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    subjectCreate,
    freeSubjectList,
    classSubjects,
    getSubjectDetail,
    updateSubject,
    deleteSubjectsByClass,
    deleteSubjects,
    deleteSubject,
    allSubjects
};