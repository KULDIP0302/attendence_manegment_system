const express = require('express');

const {
    adminRegister,
    adminLogIn,
    getAdminDetail,
    deleteAdmin,
    updateAdmin,
} = require('../controllers/admin-controller');

const {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getTeacherDetail,
    updateTeacherSubject,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    teacherAttendance,
} = require('../controllers/teacher-controller');

const {
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
} = require('../controllers/student_controller');

const {
    sclassCreate,
    sclassList,
    deleteSclass,
    deleteSclasses,
    getSclassDetail,
    getSclassStudents,
} = require('../controllers/class-controller');

const {
    subjectCreate,
    freeSubjectList,
    classSubjects,
    getSubjectDetail,
    updateSubject,
    deleteSubjectsByClass,
    deleteSubjects,
    deleteSubject,
    allSubjects,
} = require('../controllers/subject-controller');

const {
    noticeCreate,
    noticeList,
    updateNotice,
    deleteNotice,
    deleteNotices,
} = require('../controllers/notice-controller');

const {
    complainCreate,
    complainList,
} = require('../controllers/complain-controller');

const { requireAuth, requireRole } = require('../middleware/auth');
const {
    markAttendanceBulk,
    getStudentAttendance,
    teacherMonthlyReport,
} = require('../controllers/attendance-controller');

const {
    createLeaveRequest,
    getTeacherLeaveRequests,
    decideLeaveRequest,
    getStudentLeaveRequests,
} = require('../controllers/leaveRequest-controller');
const {
    markAttendance,
    getClassAttendanceByDate,
    getMonthlyReportByClass,
    getStudentsByClass,
    getAttendanceByQuery,
    getAttendanceRecordCountBySchool,
    getStudentAttendanceHistory,
} = require('../controllers/attendance-v2-controller');
const {
    getLeaveRequests,
    updateLeaveRequestStatus,
} = require('../controllers/leave-v2-controller');
const { login } = require('../controllers/auth-controller');
const {
    getTeacherClassReport,
    getStudentSelfReport,
} = require('../controllers/report-controller');

const router = express.Router();

// Admin auth and CRUD
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);
router.get('/Admin/:id', getAdminDetail);
router.put('/Admin/:id', updateAdmin);
router.delete('/Admin/:id', deleteAdmin);

// Teacher auth and operations
router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn);
router.get('/Teachers/:id', getTeachers);
router.get('/Teacher/:id', getTeacherDetail);
router.put('/TeacherSubject', updateTeacherSubject);
router.delete('/Teacher/:id', deleteTeacher);
router.delete('/Teachers/:id', deleteTeachers);
router.delete('/TeachersByClass/:id', deleteTeachersByClass);
router.put('/TeacherAttendance/:id', teacherAttendance);

// Student auth and operations
router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn);
router.get('/Students/:id', getStudents);
router.get('/Student/:id', getStudentDetail);
router.put('/Student/:id', updateStudent);
router.delete('/Student/:id', deleteStudent);
router.delete('/Students/:id', deleteStudents);
router.delete('/StudentsByClass/:id', deleteStudentsByClass);

// Student marks and attendance
router.put('/UpdateExamResult/:id', updateExamResult);
router.put('/StudentAttendance/:id', studentAttendance);
router.put('/ClearAllStudentsAttendanceBySubject/:id', clearAllStudentsAttendanceBySubject);
router.put('/ClearAllStudentsAttendance/:id', clearAllStudentsAttendance);
router.put('/RemoveStudentAttendanceBySubject/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAttendance/:id', removeStudentAttendance);

// Classes
router.post('/SclassCreate', sclassCreate);
router.get('/SclassList/:id', sclassList);
router.get('/Sclass/:id', getSclassDetail);
router.get('/Sclass/Students/:id', getSclassStudents);
router.delete('/Sclass/:id', deleteSclass);
router.delete('/Sclasses/:id', deleteSclasses);

// Subjects
router.post('/SubjectCreate', subjectCreate);
router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get('/Subject/:id', getSubjectDetail);
router.put('/Subject/:id', updateSubject);
router.delete('/Subject/:id', deleteSubject);
router.delete('/Subjects/:id', deleteSubjects);
router.delete('/SubjectsByClass/:id', deleteSubjectsByClass);

// Notices
router.post('/NoticeCreate', noticeCreate);
router.get('/NoticeList/:id', noticeList);
router.put('/Notice/:id', updateNotice);
router.delete('/Notice/:id', deleteNotice);
router.delete('/Notices/:id', deleteNotices);

// Complains
router.post('/ComplainCreate', complainCreate);
router.get('/ComplainList/:id', complainList);

// Attendance (JWT-protected)
router.post('/Attendance/Mark', requireAuth, requireRole('Teacher'), markAttendanceBulk);
router.get('/Attendance/Student/:studentId', requireAuth, getStudentAttendance);
router.get('/Attendance/Teacher/MonthlyReport', requireAuth, requireRole('Teacher'), teacherMonthlyReport);

// Leave Requests (JWT-protected)
router.post('/LeaveRequest/Create', requireAuth, requireRole('Student'), createLeaveRequest);
router.get('/LeaveRequest/Teacher', requireAuth, requireRole('Teacher'), getTeacherLeaveRequests);
router.put('/LeaveRequest/Decision', requireAuth, requireRole('Teacher'), decideLeaveRequest);

// Teacher Attendance Management V2 APIs
router.post('/api/attendance/mark', requireAuth, requireRole('Teacher'), markAttendance);
router.get('/api/attendance/class/:classId', requireAuth, requireRole('Teacher'), getClassAttendanceByDate);
router.get('/api/attendance/monthly/:classId', requireAuth, requireRole('Teacher'), getMonthlyReportByClass);
router.get('/api/attendance/student/:studentId', requireAuth, getStudentAttendanceHistory);
router.get('/api/leave', requireAuth, requireRole('Teacher'), getLeaveRequests);
router.post('/api/leave/request', requireAuth, requireRole('Student'), createLeaveRequest);
router.get('/api/leave/request', requireAuth, requireRole('Student'), getStudentLeaveRequests);
router.get('/api/leave/requests', requireAuth, requireRole('Teacher'), getLeaveRequests);
router.put('/api/leave/:id', requireAuth, requireRole('Teacher'), updateLeaveRequestStatus);
router.post('/attendance', requireAuth, requireRole('Teacher'), markAttendance);
router.get('/attendance', requireAuth, requireRole('Teacher'), getAttendanceByQuery);
router.get('/students', requireAuth, getStudentsByClass);
router.get('/api/attendance/records/count/:schoolId', getAttendanceRecordCountBySchool);

// Auth endpoints
router.post('/api/auth/login', login);
router.post('/login', login);

// Reports
router.get('/api/reports/teacher/class', requireAuth, requireRole('Teacher'), getTeacherClassReport);
router.get('/api/reports/student/self', requireAuth, requireRole('Student'), getStudentSelfReport);

module.exports = router;