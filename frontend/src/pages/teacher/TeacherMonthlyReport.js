import React from 'react';
import axios from 'axios';
import {
    Alert,
    Button,
    Grid,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
const getPercentageColor = (val) => {
    const n = Number(val) || 0;
    if (n >= 75) return 'success.main';
    if (n >= 40) return 'warning.main';
    return 'error.main';
};

const TeacherMonthlyReport = () => {
    const { currentUser } = useSelector((state) => state.user);
    const token = currentUser?.token;

    const classOptions = currentUser?.teachSclass ? [currentUser.teachSclass] : [];
    const [classID, setClassID] = React.useState(currentUser?.teachSclass?._id || '');
    const now = new Date();
    const [month, setMonth] = React.useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [report, setReport] = React.useState(null);

    const fetchReport = async () => {
        if (!token) {
            setMessage('Missing authentication token. Please log in again.');
            return;
        }
        if (!classID) {
            setMessage('Teacher class not configured.');
            return;
        }

        setLoading(true);
        setMessage('');
        try {
            try {
                const res = await axios.get(`${BASE_URL}/api/reports/teacher/class`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { month, classId: classID },
                });
                setReport(res.data || null);
            } catch (errNew) {
                // Fallback to legacy monthly endpoint.
                const resLegacy = await axios.get(`${BASE_URL}/api/attendance/monthly/${classID}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { month },
                });
                const legacyRows = Array.isArray(resLegacy.data) ? resLegacy.data : [];
                let subjectWiseAttendance = [];
                try {
                    const classSubjectsRes = await axios.get(`${BASE_URL}/ClassSubjects/${classID}`);
                    const classSubjects = Array.isArray(classSubjectsRes.data) ? classSubjectsRes.data : [];
                    const subjectReports = await Promise.all(
                        classSubjects.map(async (subject) => {
                            const bySubject = await axios.get(`${BASE_URL}/api/attendance/monthly/${classID}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                params: { month, subjectId: subject._id },
                            });
                            const rows = Array.isArray(bySubject.data) ? bySubject.data : [];
                            const present = rows.reduce((acc, row) => acc + Number(row.totalPresent || row.present || 0), 0);
                            const absent = rows.reduce((acc, row) => acc + Number(row.totalAbsent || row.absent || 0), 0);
                            const total = present + absent;
                            return {
                                subject: subject.subName,
                                present,
                                absent,
                                monthlyAttendancePercentage: total ? (present / total) * 100 : 0,
                            };
                        })
                    );
                    subjectWiseAttendance = subjectReports.filter((r) => r.present > 0 || r.absent > 0);
                } catch {
                    subjectWiseAttendance = [];
                }

                const totalStudents = legacyRows.length;
                const presentCount = legacyRows.reduce((acc, row) => acc + Number(row.totalPresent || row.present || 0), 0);
                const absentCount = legacyRows.reduce((acc, row) => acc + Number(row.totalAbsent || row.absent || 0), 0);
                const total = presentCount + absentCount;

                setReport({
                    totalStudents,
                    presentCount,
                    absentCount,
                    monthlyAttendancePercentage: total ? (presentCount / total) * 100 : 0,
                    subjectWiseAttendance,
                    studentWiseAttendance: legacyRows.map((row) => ({
                        studentId: row.studentId,
                        rollNum: row.rollNum || '-',
                        name: row.name,
                        present: Number(row.totalPresent || row.present || 0),
                        absent: Number(row.totalAbsent || row.absent || 0),
                        monthlyAttendancePercentage: Number(row.attendancePercentage || 0),
                    })),
                });
            }
        } catch (err) {
            const apiMessage = err?.response?.data?.message || 'Failed to load monthly report';
            setMessage(apiMessage);
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (classID && month && token) fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classID, month, token]);

    return (
        <Stack spacing={2}>
            <Typography variant="h3" sx={{ fontWeight: 900, fontSize: { xs: '1.9rem', md: '2.2rem' } }}>
                Monthly Report
            </Typography>

            <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-end' }}>
                    <TextField
                        select
                        label="Class"
                        value={classID}
                        onChange={(e) => setClassID(e.target.value)}
                        sx={{ minWidth: 220 }}
                    >
                        {classOptions.map((c) => (
                            <MenuItem key={c._id} value={c._id}>{c.sclassName}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Month"
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        sx={{ '& .MuiInputBase-input': { fontSize: '1rem' } }}
                    />
                    <Button variant="contained" onClick={fetchReport} disabled={loading || !classID}>
                        Generate Report
                    </Button>
                </Stack>
            </Paper>

            {message ? <Alert severity="error">{message}</Alert> : null}
            {loading ? (
                <Typography>Loading...</Typography>
            ) : (
                <>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 2, borderRadius: 2 }}>
                                <Typography fontWeight={800}>Total Students</Typography>
                                <Typography variant="h4" fontWeight={900}>{report?.totalStudents || 0}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 2, borderRadius: 2 }}>
                                <Typography fontWeight={800}>Present / Absent</Typography>
                                <Typography variant="h5" fontWeight={900}>{report?.presentCount || 0} / {report?.absentCount || 0}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 2, borderRadius: 2 }}>
                                <Typography fontWeight={800}>Monthly Attendance %</Typography>
                                <Typography variant="h4" fontWeight={900} color={getPercentageColor(report?.monthlyAttendancePercentage)}>
                                    {Number(report?.monthlyAttendancePercentage || 0).toFixed(2)}%
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, fontSize: { xs: '1.55rem', md: '1.85rem' } }}>
                        Subject-wise Attendance
                    </Typography>
                    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Table
                            stickyHeader
                            sx={{
                                '& .MuiTableCell-root': { fontSize: { xs: '1.03rem', md: '1.12rem' }, py: 1.6 },
                                '& .MuiTableCell-head': { fontSize: { xs: '1.1rem', md: '1.22rem' }, fontWeight: 900 },
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>Subject</TableCell>
                                    <TableCell align="right">Present</TableCell>
                                    <TableCell align="right">Absent</TableCell>
                                    <TableCell align="right">Percentage</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(report?.subjectWiseAttendance || []).length > 0 ? (
                                    (report?.subjectWiseAttendance || []).map((s) => (
                                        <TableRow key={s.subject}>
                                            <TableCell>{s.subject}</TableCell>
                                            <TableCell align="right">{s.present}</TableCell>
                                            <TableCell align="right">{s.absent}</TableCell>
                                            <TableCell align="right" sx={{ color: getPercentageColor(s.monthlyAttendancePercentage), fontWeight: 700 }}>
                                                {Number(s.monthlyAttendancePercentage || 0).toFixed(2)}%
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell align="center" colSpan={4}>No subject data found</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, fontSize: { xs: '1.55rem', md: '1.85rem' } }}>
                        Student-wise Attendance
                    </Typography>
                    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Table
                            stickyHeader
                            sx={{
                                '& .MuiTableCell-root': { fontSize: { xs: '1.03rem', md: '1.14rem' }, py: 1.7 },
                                '& .MuiTableCell-head': { fontSize: { xs: '1.12rem', md: '1.25rem' }, fontWeight: 900 },
                                '& .MuiTableBody-root .MuiTableRow-root:hover': { backgroundColor: '#eef4ff' },
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>Roll No</TableCell>
                                    <TableCell>Student Name</TableCell>
                                    <TableCell align="right">Present</TableCell>
                                    <TableCell align="right">Absent</TableCell>
                                    <TableCell align="right">Monthly %</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(report?.studentWiseAttendance || []).length > 0 ? (
                                    (report?.studentWiseAttendance || []).map((r) => (
                                        <TableRow key={r.studentId}>
                                            <TableCell>{r.rollNum}</TableCell>
                                            <TableCell>{r.name}</TableCell>
                                            <TableCell align="right">{r.present}</TableCell>
                                            <TableCell align="right">{r.absent}</TableCell>
                                            <TableCell align="right" sx={{ color: getPercentageColor(r.monthlyAttendancePercentage), fontWeight: 700 }}>
                                                {Number(r.monthlyAttendancePercentage || 0).toFixed(2)}%
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell align="center" colSpan={5}>No student data found for this month</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Stack>
    );
};

export default TeacherMonthlyReport;

