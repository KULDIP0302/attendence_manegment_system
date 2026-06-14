import React from 'react';
import axios from 'axios';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Paper,
    Stack,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    TextField,
    Typography,
} from '@mui/material';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import { useSelector } from 'react-redux';

const toIndianDate = (dateInput) => {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return String(dateInput || '');
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const normalizeDateKey = (dateInput) => {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
};

const normalizeSubject = (value) => {
    const subject = String(value || '').trim();
    if (!subject) return '';
    if (subject.toLowerCase() === 'class attendance') return '';
    return subject;
};

const pageBg = 'linear-gradient(180deg, rgba(248, 251, 255, 0.95) 0%, rgba(238, 245, 255, 0.98) 100%)';

const headerRowSx = {
    background: 'linear-gradient(90deg, #5f82c8 0%, #7ea4f3 100%)',
    '& .MuiTableCell-head': {
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.95rem',
        py: 1.75,
        borderBottom: 'none',
    },
};

const fieldSx = {
    minWidth: { xs: '100%', sm: 220 },
    '& .MuiInputLabel-root': { fontWeight: 600 },
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.95)',
        '& fieldset': { borderColor: 'rgba(36, 59, 100, 0.14)' },
        '&:hover fieldset': { borderColor: 'rgba(95, 130, 200, 0.45)' },
        '&.Mui-focused fieldset': { borderColor: '#5f82c8', borderWidth: 2 },
    },
};

const statPaperSx = {
    p: 2.25,
    borderRadius: '16px',
    height: '100%',
    border: '1px solid rgba(95, 130, 200, 0.2)',
    boxShadow: '0 8px 24px rgba(36, 59, 100, 0.08)',
    background: 'linear-gradient(145deg, #ffffff 0%, rgba(248, 251, 255, 0.9) 100%)',
};

const ViewStdAttendance = () => {
    const { currentUser } = useSelector((state) => state.user);
    const studentId = currentUser?._id || currentUser?.id;
    const token = currentUser?.token;
    const [rows, setRows] = React.useState([]);
    const [attendanceLoading, setAttendanceLoading] = React.useState(false);
    const [attendanceError, setAttendanceError] = React.useState('');
    const [month, setMonth] = React.useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    React.useEffect(() => {
        const fetchAttendance = async () => {
            if (!studentId || !token) {
                setAttendanceError('Please login again to view attendance.');
                return;
            }

            setAttendanceLoading(true);
            setAttendanceError('');
            try {
                const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
                const res = await axios.get(`${BASE_URL}/api/attendance/student/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const primaryRows = (Array.isArray(res.data) ? res.data : []).map((r) => ({
                    date: r.date,
                    status: r.status,
                    subject: normalizeSubject(r?.subject || r?.subjectId?.subName || r?.subName?.subName),
                }));

                let mergedRows = primaryRows;
                const needsSubjectEnrichment = primaryRows.some((r) => !r.subject);

                if (needsSubjectEnrichment) {
                    try {
                        const fallback = await axios.get(`${BASE_URL}/Attendance/Student/${studentId}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const fallbackRows = Array.isArray(fallback.data) ? fallback.data : [];
                        const subjectByDateStatus = new Map(
                            fallbackRows.map((r) => {
                                const key = `${normalizeDateKey(r.date)}::${r.status}`;
                                const subject = normalizeSubject(r?.subjectId?.subName || r?.subName?.subName || r?.subject);
                                return [key, subject];
                            })
                        );

                        mergedRows = primaryRows.map((r) => {
                            const key = `${normalizeDateKey(r.date)}::${r.status}`;
                            return {
                                ...r,
                                subject: r.subject || subjectByDateStatus.get(key) || 'Subject',
                            };
                        });
                    } catch {
                        mergedRows = primaryRows.map((r) => ({
                            ...r,
                            subject: r.subject || 'Subject',
                        }));
                    }
                } else {
                    mergedRows = primaryRows.map((r) => ({ ...r, subject: r.subject || 'Subject' }));
                }

                setRows(mergedRows);
            } catch (err) {
                try {
                    const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
                    const fallback = await axios.get(`${BASE_URL}/Attendance/Student/${studentId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const mapped = (Array.isArray(fallback.data) ? fallback.data : []).map((r) => ({
                        date: r.date,
                        subject: r?.subjectId?.subName || r?.subName?.subName || 'Subject',
                        status: r.status,
                    }));
                    setRows(mapped);
                } catch (fallbackErr) {
                    const apiMessage = fallbackErr?.response?.data?.message || err?.response?.data?.message || 'Failed to load attendance';
                    setAttendanceError(apiMessage);
                    setRows([]);
                }
            } finally {
                setAttendanceLoading(false);
            }
        };

        fetchAttendance();
    }, [studentId, token]);

    const monthlyRows = React.useMemo(() => {
        if (!Array.isArray(rows) || !month) return [];
        return rows.filter((row) => {
            const d = new Date(row.date);
            if (Number.isNaN(d.getTime())) return false;
            const rowMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            return rowMonth === month;
        });
    }, [rows, month]);

    const computedReport = React.useMemo(() => {
        const subjectMap = new Map();
        let presentCount = 0;
        let absentCount = 0;

        for (const row of monthlyRows) {
            const subject = normalizeSubject(row?.subject) || 'Subject';
            const status = row?.status || 'Absent';
            const current = subjectMap.get(subject) || { subject, present: 0, absent: 0, total: 0 };

            current.total += 1;
            if (status === 'Present') {
                current.present += 1;
                presentCount += 1;
            } else {
                current.absent += 1;
                absentCount += 1;
            }
            subjectMap.set(subject, current);
        }

        const total = presentCount + absentCount;
        const subjectWiseAttendance = Array.from(subjectMap.values()).map((entry) => ({
            subject: entry.subject,
            present: entry.present,
            absent: entry.absent,
            monthlyAttendancePercentage: entry.total ? (entry.present / entry.total) * 100 : 0,
        }));

        return {
            presentCount,
            absentCount,
            monthlyAttendancePercentage: total ? (presentCount / total) * 100 : 0,
            subjectWiseAttendance,
        };
    }, [monthlyRows]);

    const chipSx = (status) => ({
        fontWeight: 800,
        color: '#fff',
        borderRadius: '10px',
        backgroundColor:
            status === 'Present' ? '#2e7d32' : status === 'Absent' ? '#c62828' : '#ed6c02',
    });

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '100%',
                py: { xs: 2.5, sm: 3.5 },
                px: { xs: 1.5, sm: 2.5 },
                background: pageBg,
            }}
        >
            <Container maxWidth="lg" disableGutters>
                <Stack spacing={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2.5, sm: 3 },
                            borderRadius: '20px',
                            border: '1px solid rgba(95, 130, 200, 0.18)',
                            boxShadow: '0 14px 40px rgba(36, 59, 100, 0.1), 0 2px 10px rgba(36, 59, 100, 0.06)',
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'linear-gradient(135deg, rgba(95, 130, 200, 0.25) 0%, rgba(126, 164, 243, 0.2) 100%)',
                                    border: '1px solid rgba(95, 130, 200, 0.35)',
                                }}
                            >
                                <FactCheckRoundedIcon sx={{ fontSize: 32, color: '#304b7c' }} />
                            </Box>
                            <Box>
                                <Typography
                                    component="h1"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: { xs: '1.65rem', sm: '2rem' },
                                        letterSpacing: '-0.02em',
                                        color: '#243b64',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Attendance History
                                </Typography>
                            </Box>
                        </Stack>

                        {attendanceError ? (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                                {attendanceError}
                            </Alert>
                        ) : null}

                        <TableContainer
                            sx={{
                                borderRadius: '14px',
                                border: '1px solid rgba(95, 130, 200, 0.16)',
                                overflow: 'hidden',
                                boxShadow: '0 4px 18px rgba(36, 59, 100, 0.06)',
                            }}
                        >
                            <Table
                                stickyHeader
                                sx={{
                                    '& .MuiTableCell-root': { fontSize: { xs: '0.98rem', md: '1.02rem' }, py: 1.35 },
                                    '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': {
                                        backgroundColor: 'rgba(95, 130, 200, 0.04)',
                                    },
                                    '& .MuiTableBody-root .MuiTableRow-root:hover': { backgroundColor: 'rgba(95, 130, 200, 0.09)' },
                                }}
                            >
                                <TableHead>
                                    <TableRow sx={headerRowSx}>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Subject</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attendanceLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 5, borderBottom: 'none' }}>
                                                <CircularProgress size={36} sx={{ color: '#5f82c8' }} />
                                            </TableCell>
                                        </TableRow>
                                    ) : rows.length > 0 ? (
                                        rows.map((r, idx) => (
                                            <TableRow key={`${r.date}-${idx}`}>
                                                <TableCell sx={{ fontWeight: 600, color: '#243b64' }}>{toIndianDate(r.date)}</TableCell>
                                                <TableCell sx={{ color: 'rgba(36, 59, 100, 0.88)' }}>
                                                    {normalizeSubject(r.subject) || 'Subject'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={r.status} size="small" sx={chipSx(r.status)} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 5, borderBottom: 'none' }}>
                                                <Typography sx={{ color: 'rgba(36, 59, 100, 0.55)', fontWeight: 600 }}>
                                                    No attendance data available
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2.5, sm: 3.25 },
                            borderRadius: '20px',
                            border: '1px solid rgba(95, 130, 200, 0.18)',
                            boxShadow: '0 14px 40px rgba(36, 59, 100, 0.08), 0 2px 10px rgba(36, 59, 100, 0.05)',
                        }}
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                            <AssessmentRoundedIcon sx={{ fontSize: 32, color: '#5f82c8' }} />
                            <Typography
                                component="h2"
                                sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: '1.35rem', sm: '1.5rem' },
                                    color: '#243b64',
                                }}
                            >
                                My Attendance Report (Read-only)
                            </Typography>
                        </Stack>

                        <Divider sx={{ mb: 2.5, borderColor: 'rgba(95, 130, 200, 0.2)' }} />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-end' }} sx={{ mb: 2.5 }}>
                            <TextField
                                type="month"
                                label="Month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                sx={fieldSx}
                                InputLabelProps={{ shrink: true }}
                            />
                            <Button
                                variant="outlined"
                                disabled
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    borderWidth: 2,
                                    borderColor: 'rgba(95, 130, 200, 0.35)',
                                    color: 'rgba(36, 59, 100, 0.45)',
                                    py: 1.1,
                                    px: 2.5,
                                }}
                            >
                                Auto Updated
                            </Button>
                        </Stack>

                        <Grid container spacing={2} sx={{ mb: 2.5 }}>
                            <Grid item xs={12} md={4}>
                                <Paper elevation={0} sx={statPaperSx}>
                                    <Typography sx={{ fontWeight: 700, color: 'rgba(36, 59, 100, 0.75)', fontSize: '0.95rem' }}>
                                        Present / Absent
                                    </Typography>
                                    <Typography sx={{ mt: 1, fontSize: { xs: '1.65rem', sm: '1.85rem' }, fontWeight: 900, color: '#243b64' }}>
                                        {computedReport.presentCount || 0} / {computedReport.absentCount || 0}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper elevation={0} sx={statPaperSx}>
                                    <Typography sx={{ fontWeight: 700, color: 'rgba(36, 59, 100, 0.75)', fontSize: '0.95rem' }}>
                                        Monthly Attendance %
                                    </Typography>
                                    <Typography
                                        sx={{
                                            mt: 1,
                                            fontSize: { xs: '2rem', sm: '2.25rem' },
                                            fontWeight: 900,
                                            background: 'linear-gradient(90deg, #5f82c8, #304b7c)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        {Number(computedReport.monthlyAttendancePercentage || 0).toFixed(2)}%
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        <Typography sx={{ fontSize: { xs: '1.1rem', md: '1.2rem' }, fontWeight: 800, color: '#243b64', mb: 1.5 }}>
                            Subject-wise Attendance
                        </Typography>
                        <TableContainer
                            sx={{
                                borderRadius: '14px',
                                border: '1px solid rgba(95, 130, 200, 0.16)',
                                overflow: 'hidden',
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow sx={headerRowSx}>
                                        <TableCell>Subject</TableCell>
                                        <TableCell align="right">Present</TableCell>
                                        <TableCell align="right">Absent</TableCell>
                                        <TableCell align="right">Monthly %</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(computedReport.subjectWiseAttendance || []).length > 0 ? (
                                        computedReport.subjectWiseAttendance.map((row) => (
                                            <TableRow
                                                key={row.subject}
                                                hover
                                                sx={{
                                                    '&:nth-of-type(even)': { backgroundColor: 'rgba(95, 130, 200, 0.04)' },
                                                }}
                                            >
                                                <TableCell sx={{ fontWeight: 600, color: '#243b64' }}>{row.subject}</TableCell>
                                                <TableCell align="right">{row.present}</TableCell>
                                                <TableCell align="right">{row.absent}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, color: '#304b7c' }}>
                                                    {Number(row.monthlyAttendancePercentage || 0).toFixed(2)}%
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                <Typography sx={{ color: 'rgba(36, 59, 100, 0.55)', fontWeight: 600 }}>
                                                    No subject-wise attendance data found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
};

export default ViewStdAttendance;
