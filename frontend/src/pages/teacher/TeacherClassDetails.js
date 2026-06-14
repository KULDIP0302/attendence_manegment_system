import { useEffect } from "react";
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { getSubjectList } from "../../redux/sclassRelated/sclassHandle";
import { getAllSclasses } from "../../redux/sclassRelated/sclassHandle";
import { Button, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TextField, Stack, Alert } from '@mui/material';
import { GreenButton, RedButton } from "../../components/buttonStyles";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const TeacherClassDetails = () => {
    const dispatch = useDispatch();
    const { sclassStudents, subjectsList, sclassesList, loading, getresponse } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);

    const schoolId = currentUser?.school?._id || currentUser?.school;
    const [classID, setClassID] = React.useState(currentUser?.teachSclass?._id || '');
    const token = currentUser?.token;

    const [selectedDate, setSelectedDate] = React.useState(() => {
        const d = new Date();
        const local = new Date(d);
        local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
        return local.toISOString().slice(0, 10);
    });
    const [statusByStudentId, setStatusByStudentId] = React.useState({}); // saved (already marked)
    const [draftByStudentId, setDraftByStudentId] = React.useState({});   // local selections before submit
    const [submitting, setSubmitting] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [successMessage, setSuccessMessage] = React.useState('');
    const [selectedSubjectId, setSelectedSubjectId] = React.useState('');

    useEffect(() => {
        if (schoolId) dispatch(getAllSclasses(schoolId, "Sclass"));
    }, [dispatch, schoolId]);

    useEffect(() => {
        if (!classID && Array.isArray(sclassesList) && sclassesList.length > 0) {
            setClassID(sclassesList[0]._id);
        }
    }, [sclassesList, classID]);

    useEffect(() => {
        if (classID) dispatch(getClassStudents(classID));
    }, [dispatch, classID]);

    useEffect(() => {
        if (classID) dispatch(getSubjectList(classID, "ClassSubjects"));
    }, [dispatch, classID]);

    useEffect(() => {
        if (!selectedSubjectId && Array.isArray(subjectsList) && subjectsList.length > 0) {
            setSelectedSubjectId(subjectsList[0]._id);
        }
    }, [subjectsList, selectedSubjectId]);

    useEffect(() => {
        const fetchExistingAttendance = async () => {
            if (!token || !classID || !selectedDate || !selectedSubjectId) return;
            try {
                const base = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
                const res = await axios.get(`${base}/api/attendance/class/${classID}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { date: selectedDate, subjectId: selectedSubjectId },
                });
                const existing = {};
                for (const row of res.data?.students || []) {
                    existing[row.studentId] = row.status;
                }
                setStatusByStudentId(existing);
                setDraftByStudentId({});
            } catch (err) {
                setMessage(err?.response?.data?.message || 'Failed to load attendance');
            }
        };

        setMessage('');
        setSuccessMessage('');
        fetchExistingAttendance();
    }, [selectedDate, classID, token, selectedSubjectId]);

    const toApiBaseUrl = () => process.env.REACT_APP_BASE_URL || "http://localhost:5000";

    const submitAttendance = async () => {
        if (!token) {
            setMessage('Missing authentication token. Please log in again.');
            return false;
        }
        if (!classID) {
            setMessage('Teacher class not configured.');
            return false;
        }
        if (!selectedSubjectId) {
            setMessage('Please select a subject first.');
            return false;
        }
        if (studentRows.length === 0) {
            setMessage('No students to submit attendance for.');
            return false;
        }
        const payloadStudents = Object.entries(draftByStudentId)
            .filter(([, status]) => status === 'Present' || status === 'Absent')
            .map(([studentId, status]) => ({ studentId, status }));
        if (payloadStudents.length === 0) {
            setMessage('No attendance payload to save');
            return false;
        }

        setMessage('');
        setSuccessMessage('');
        try {
            setSubmitting(true);
            await axios.post(
                `${toApiBaseUrl()}/api/attendance/mark`,
                { classId: classID, date: selectedDate, subjectId: selectedSubjectId, students: payloadStudents },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccessMessage('Attendance saved');
            setStatusByStudentId((prev) => {
                const next = { ...prev };
                for (const s of payloadStudents) next[s.studentId] = s.status;
                return next;
            });
            setDraftByStudentId({});
            return true;
        } catch (err) {
            setMessage(err?.response?.data?.message || 'Failed to submit attendance');
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const markStudent = (studentId, status) => {
        setDraftByStudentId((prev) => ({ ...prev, [studentId]: status }));
    };

    const studentRows = Array.isArray(sclassStudents)
        ? sclassStudents.map((student) => ({
            id: student._id,
            rollNum: student.rollNum,
            name: student.name,
        }))
        : [];

    const formatDate = (isoDateString) => {
        const [y, m, d] = String(isoDateString).split('-');
        if (!y || !m || !d) return isoDateString;
        return `${d}/${m}/${y}`;
    };

    return (
        <Stack spacing={2}>
            <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: '1.6rem', md: '1.9rem' } }}>
                Class
            </Typography>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
            >
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.35rem', md: '1.55rem' } }}>
                    Students
                </Typography>
                <TextField
                    select
                    label="Class"
                    value={classID}
                    onChange={(e) => setClassID(e.target.value)}
                    sx={{ minWidth: 220, '& .MuiInputBase-input': { fontSize: '1rem' } }}
                    SelectProps={{ native: true }}
                >
                    {Array.isArray(sclassesList) && sclassesList.length > 0 ? (
                        sclassesList.map((sclass) => (
                            <option key={sclass._id} value={sclass._id}>
                                {sclass.sclassName}
                            </option>
                        ))
                    ) : (
                        <option value="">No classes found</option>
                    )}
                </TextField>
                <TextField
                    select
                    label="Subject"
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    sx={{ minWidth: 220, '& .MuiInputBase-input': { fontSize: '1rem' } }}
                    SelectProps={{ native: true }}
                >
                    {Array.isArray(subjectsList) && subjectsList.length > 0 ? (
                        subjectsList.map((subject) => (
                            <option key={subject._id} value={subject._id}>
                                {subject.subName}
                            </option>
                        ))
                    ) : (
                        <option value="">No subjects found</option>
                    )}
                </TextField>
                <TextField
                    label="Date"
                    type="date"
                    value={selectedDate}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    sx={{ minWidth: 220, '& .MuiInputBase-input': { fontSize: '1rem' } }}
                />
            </Stack>

            {message ? <Alert severity="error">{message}</Alert> : null}
            {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
            {loading ? (
                <Typography variant="body1">Loading...</Typography>
            ) : getresponse ? (
                <Typography variant="body1">No Students Found</Typography>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
                    <Table
                        stickyHeader
                        sx={{
                            '& .MuiTableCell-root': { fontSize: { xs: '1rem', md: '1.08rem' }, py: 1.5 },
                            '& .MuiTableCell-head': { fontSize: { xs: '1.08rem', md: '1.15rem' }, fontWeight: 800 },
                            '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                            '& .MuiTableBody-root .MuiTableRow-root:hover': { backgroundColor: '#eef4ff' },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>Roll Number</TableCell>
                                <TableCell>Student Name</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {studentRows.map((row) => {
                                const savedStatus = statusByStudentId[row.id];
                                const draftStatus = draftByStudentId[row.id];

                                return (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.rollNum}</TableCell>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{formatDate(selectedDate)}</TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <GreenButton
                                                    variant={(savedStatus || draftStatus) === 'Present' ? 'contained' : 'outlined'}
                                                    size="small"
                                                    onClick={() => markStudent(row.id, 'Present')}
                                                    disabled={submitting}
                                                    sx={{
                                                        fontSize: '1.02rem',
                                                        borderWidth: (savedStatus || draftStatus) === 'Present' ? 0 : 2,
                                                        boxShadow: (savedStatus || draftStatus) === 'Present' ? 3 : 0,
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                >
                                                    <CheckCircleIcon sx={{ mr: 0.5, fontSize: 18 }} /> Present
                                                </GreenButton>
                                                <RedButton
                                                    variant={(savedStatus || draftStatus) === 'Absent' ? 'contained' : 'outlined'}
                                                    size="small"
                                                    onClick={() => markStudent(row.id, 'Absent')}
                                                    disabled={submitting}
                                                    sx={{
                                                        fontSize: '1.02rem',
                                                        borderWidth: (savedStatus || draftStatus) === 'Absent' ? 0 : 2,
                                                        boxShadow: (savedStatus || draftStatus) === 'Absent' ? 3 : 0,
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                >
                                                    <CancelIcon sx={{ mr: 0.5, fontSize: 18 }} /> Absent
                                                </RedButton>
                                            </Stack>
                                            {savedStatus ? (
                                                <Typography sx={{ mt: 0.8, fontSize: '0.88rem', fontWeight: 700 }}>
                                                    Saved: {savedStatus}
                                                </Typography>
                                            ) : draftStatus ? (
                                                <Typography sx={{ mt: 0.8, fontSize: '0.88rem', fontWeight: 700 }}>
                                                    Selected: {draftStatus}
                                                </Typography>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {studentRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No students found
                                    </TableCell>
                                </TableRow>
                            ) : null}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            {!loading && !getresponse ? (
                <Button
                    variant="contained"
                    onClick={submitAttendance}
                    disabled={submitting || Object.keys(draftByStudentId).length === 0}
                    sx={{ alignSelf: 'flex-end', px: 4, py: 1.2, fontSize: '1.05rem', fontWeight: 800 }}
                >
                    {submitting ? 'Submitting...' : 'Submit'}
                </Button>
            ) : null}
        </Stack>
    );
};

export default TeacherClassDetails;