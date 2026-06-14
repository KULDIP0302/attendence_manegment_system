import React from 'react';
import axios from 'axios';
import { Alert, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

const TeacherLeaveRequests = () => {
    const { currentUser } = useSelector((state) => state.user);
    const token = currentUser?.token;

    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [requests, setRequests] = React.useState([]);

    const fetchRequestsV2 = async () => {
        if (!token) {
            setMessage('Missing authentication token. Please log in again.');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            let rows = [];
            try {
                const res = await axios.get(`${BASE_URL}/api/leave/requests`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                rows = Array.isArray(res.data) ? res.data : [];
            } catch (errV2) {
                // Fallback: old/new alternative endpoints.
                try {
                    const resAlt = await axios.get(`${BASE_URL}/api/leave`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    rows = Array.isArray(resAlt.data) ? resAlt.data : [];
                } catch (errAlt) {
                    const resLegacy = await axios.get(`${BASE_URL}/LeaveRequest/Teacher`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    rows = Array.isArray(resLegacy.data) ? resLegacy.data : [];
                }
            }
            setRequests(rows);
        } catch (err) {
            const apiMessage = err?.response?.data?.message || 'Failed to load leave requests';
            setMessage(apiMessage);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchRequestsV2();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const decide = async (requestId, nextStatus) => {
        if (!token) return;
        setLoading(true);
        setMessage('');
        try {
            try {
                await axios.put(
                    `${BASE_URL}/api/leave/${requestId}`,
                    { status: nextStatus },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (errV2) {
                await axios.put(
                    `${BASE_URL}/LeaveRequest/Decision`,
                    { requestId, status: nextStatus },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            await fetchRequestsV2();
        } catch (err) {
            const apiMessage = err?.response?.data?.message || 'Failed to update leave request';
            setMessage(apiMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d) => {
        const parsed = new Date(d);
        if (Number.isNaN(parsed.getTime())) {
            return String(d || '');
        }
        return parsed.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const statusChipColor = (status) => {
        if (status === 'Approved') return 'success';
        if (status === 'Rejected') return 'error';
        return 'warning';
    };

    return (
        <Stack spacing={2}>
            <Typography variant="h3" sx={{ fontWeight: 900, fontSize: { xs: '1.9rem', md: '2.2rem' } }}>
                Leave Request
            </Typography>

            {message ? <Alert severity="error">{message}</Alert> : null}
            {loading ? (
                <Typography>Loading...</Typography>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table
                        stickyHeader
                        sx={{
                            '& .MuiTableCell-root': { fontSize: { xs: '1rem', md: '1.05rem' }, py: 1.5 },
                            '& .MuiTableCell-head': { fontSize: { xs: '1.05rem', md: '1.12rem' }, fontWeight: 800 },
                            '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                            '& .MuiTableBody-root .MuiTableRow-root:hover': { backgroundColor: '#eef4ff' },
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>Student</TableCell>
                                <TableCell>Class</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.length > 0 ? (
                                requests.map((r) => {
                                    const status = r.status;
                                    return (
                                        <TableRow key={r._id}>
                                            <TableCell>
                                                {r.studentId?.name || 'Unknown'} ({r.studentId?.rollNum})
                                            </TableCell>
                                            <TableCell>{r.classId?.sclassName || '-'}</TableCell>
                                            <TableCell>
                                                {r.fromDate && r.toDate
                                                    ? `${formatDate(r.fromDate)} - ${formatDate(r.toDate)}`
                                                    : formatDate(r.date)}
                                            </TableCell>
                                            <TableCell>{r.reason}</TableCell>
                                            <TableCell><Chip label={status} color={statusChipColor(status)} /></TableCell>
                                            <TableCell align="right">
                                                {status === 'Pending' ? (
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Button
                                                            variant="contained"
                                                            sx={{ backgroundColor: '#133104', color: '#fff', fontSize: '1rem', '&:hover': { backgroundColor: '#266810' } }}
                                                            onClick={() => decide(r._id, 'Approved')}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            sx={{ backgroundColor: '#f00', color: '#fff', fontSize: '1rem', '&:hover': { backgroundColor: '#eb7979' } }}
                                                            onClick={() => decide(r._id, 'Rejected')}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Stack>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {status === 'Approved' ? 'Approved' : 'Rejected'}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No leave requests found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Stack>
    );
};

export default TeacherLeaveRequests;

