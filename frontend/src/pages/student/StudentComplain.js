import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
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
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import Popup from '../../components/Popup';
import { BlueButton } from '../../components/buttonStyles';
import { useSelector } from 'react-redux';
import axios from 'axios';

const fieldSx = {
    '& .MuiInputLabel-root': { fontWeight: 600, fontSize: '0.95rem' },
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        fontSize: '1rem',
        backgroundColor: 'rgba(255,255,255,0.92)',
        '& fieldset': { borderColor: 'rgba(36, 59, 100, 0.14)' },
        '&:hover fieldset': { borderColor: 'rgba(95, 130, 200, 0.45)' },
        '&.Mui-focused fieldset': { borderColor: '#5f82c8', borderWidth: 2 },
    },
};

const StudentComplain = () => {
    const [reason, setReason] = useState("");
    const [dateType, setDateType] = useState("single");
    const [date, setDate] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [requests, setRequests] = useState([]);

    const { currentUser } = useSelector(state => state.user);
    const token = currentUser?.token;

    const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const [refreshing, setRefreshing] = useState(false);

    const fetchMyRequests = async (silent = false) => {
        if (!token) return;
        if (!silent) setRefreshing(true);
        try {
            const res = await axios.get(
                `${BASE_URL}/api/leave/request`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            // Backward compatibility for older backend sessions.
            if (err?.response?.status === 404) {
                setRequests([]);
                return;
            }
            setRequests([]);
        } finally {
            if (!silent) setRefreshing(false);
        }
    };

    useEffect(() => {
        if (token) fetchMyRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        if (!token) return undefined;
        const intervalId = setInterval(() => {
            fetchMyRequests(true);
        }, 15000);
        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const submitHandler = (event) => {
        event.preventDefault()
        if (!token) {
            setShowPopup(true);
            setMessage("Session expired. Please login again.");
            return;
        }
        setLoader(true);
        setMessage('');

        const payload = {
            reason: String(reason).trim(),
        };
        if (dateType === 'single') {
            payload.date = date;
        } else {
            payload.fromDate = fromDate;
            payload.toDate = toDate;
        }

        axios.post(`${BASE_URL}/api/leave/request`, payload, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(() => {
                setLoader(false);
                setShowPopup(true);
                setMessage("Leave request submitted successfully");
                setReason("");
                setDate("");
                setFromDate("");
                setToDate("");
                fetchMyRequests();
            })
            .catch(async (err) => {
                // Fallback to legacy endpoint if new endpoint not available.
                if (err?.response?.status === 404) {
                    try {
                        await axios.post(
                            `${BASE_URL}/LeaveRequest/Create`,
                            { date: payload.date || payload.fromDate, reason: payload.reason },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setLoader(false);
                        setShowPopup(true);
                        setMessage("Leave request submitted successfully");
                        setReason("");
                        setDate("");
                        setFromDate("");
                        setToDate("");
                        fetchMyRequests();
                        return;
                    } catch (legacyErr) {
                        const legacyMessage = legacyErr?.response?.data?.message || "Network Error";
                        setLoader(false);
                        setShowPopup(true);
                        setMessage(legacyMessage);
                        return;
                    }
                }
                const apiMessage = err?.response?.data?.message || "Network Error";
                setLoader(false);
                setShowPopup(true);
                setMessage(apiMessage);
            });
    }

    const formatDate = (value) => {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return String(value || '');
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const statusColor = (status) => {
        if (status === 'Approved') return 'success';
        if (status === 'Rejected') return 'error';
        return 'warning';
    };

    const pageBg = 'linear-gradient(180deg, rgba(248, 251, 255, 0.95) 0%, rgba(238, 245, 255, 0.98) 100%)';

    return (
        <>
            <Box
                sx={{
                    flex: '1 1 auto',
                    width: '100%',
                    minHeight: '100%',
                    py: { xs: 2.5, sm: 3.5 },
                    px: { xs: 1.5, sm: 2.5 },
                    background: pageBg,
                }}
            >
                <Container maxWidth="md" disableGutters>
                    <Stack spacing={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2.5, sm: 3.25 },
                                borderRadius: '20px',
                                border: '1px solid rgba(95, 130, 200, 0.18)',
                                boxShadow: '0 14px 40px rgba(36, 59, 100, 0.1), 0 2px 10px rgba(36, 59, 100, 0.06)',
                                overflow: 'hidden',
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
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
                                    <EventNoteRoundedIcon sx={{ fontSize: 32, color: '#304b7c' }} />
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
                                        Leave Request
                                    </Typography>
                                    <Typography sx={{ mt: 0.25, color: 'rgba(36, 59, 100, 0.62)', fontSize: '1rem', fontWeight: 500 }}>
                                        Submit your dates and reason for review.
                                    </Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{ mb: 2.5, borderColor: 'rgba(95, 130, 200, 0.2)' }} />

                            <form onSubmit={submitHandler}>
                                <Stack spacing={2.5}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Date Type"
                                        value={dateType}
                                        onChange={(event) => setDateType(event.target.value)}
                                        SelectProps={{ native: true }}
                                        sx={fieldSx}
                                    >
                                        <option value="single">Single Date</option>
                                        <option value="range">Date Range</option>
                                    </TextField>
                                    {dateType === 'single' ? (
                                        <TextField
                                            fullWidth
                                            label="Select Date"
                                            type="date"
                                            value={date}
                                            onChange={(event) => setDate(event.target.value)} required
                                            InputLabelProps={{ shrink: true }}
                                            sx={fieldSx}
                                        />
                                    ) : (
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                            <TextField
                                                fullWidth
                                                label="From Date"
                                                type="date"
                                                value={fromDate}
                                                onChange={(event) => setFromDate(event.target.value)}
                                                required
                                                InputLabelProps={{ shrink: true }}
                                                sx={fieldSx}
                                            />
                                            <TextField
                                                fullWidth
                                                label="To Date"
                                                type="date"
                                                value={toDate}
                                                onChange={(event) => setToDate(event.target.value)}
                                                required
                                                InputLabelProps={{ shrink: true }}
                                                sx={fieldSx}
                                            />
                                        </Stack>
                                    )}
                                    <TextField
                                        fullWidth
                                        label="Write your leave reason"
                                        variant="outlined"
                                        value={reason}
                                        onChange={(event) => {
                                            setReason(event.target.value);
                                        }}
                                        required
                                        multiline
                                        maxRows={4}
                                        sx={fieldSx}
                                    />
                                </Stack>
                                <BlueButton
                                    fullWidth
                                    size="large"
                                    sx={{
                                        mt: 2.75,
                                        py: 1.35,
                                        fontSize: '1.05rem',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(90deg, #243b64 0%, #3d5a96 100%)',
                                        boxShadow: '0 10px 26px rgba(36, 59, 100, 0.28)',
                                        '&:hover': {
                                            background: 'linear-gradient(90deg, #304b7c 0%, #4a6bad 100%)',
                                        },
                                    }}
                                    variant="contained"
                                    type="submit"
                                    disabled={loader}
                                >
                                    {loader ? <CircularProgress size={26} color="inherit" /> : "Add"}
                                </BlueButton>
                            </form>
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2.25, sm: 3 },
                                borderRadius: '20px',
                                border: '1px solid rgba(95, 130, 200, 0.18)',
                                boxShadow: '0 14px 40px rgba(36, 59, 100, 0.08), 0 2px 10px rgba(36, 59, 100, 0.05)',
                            }}
                        >
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1.5}
                                alignItems={{ xs: 'stretch', sm: 'center' }}
                                justifyContent="space-between"
                                sx={{ mb: 2 }}
                            >
                                <Typography
                                    component="h2"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: { xs: '1.35rem', sm: '1.5rem' },
                                        color: '#243b64',
                                    }}
                                >
                                    My Leave Requests
                                </Typography>
                                <Button
                                    size="medium"
                                    variant="outlined"
                                    startIcon={refreshing ? undefined : <RefreshRoundedIcon />}
                                    sx={{
                                        alignSelf: { xs: 'flex-start', sm: 'center' },
                                        borderRadius: '12px',
                                        borderWidth: 2,
                                        borderColor: 'rgba(36, 59, 100, 0.35)',
                                        color: '#243b64',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        px: 2,
                                        '&:hover': {
                                            borderWidth: 2,
                                            borderColor: '#5f82c8',
                                            backgroundColor: 'rgba(95, 130, 200, 0.08)',
                                        },
                                    }}
                                    onClick={() => fetchMyRequests()}
                                    disabled={refreshing}
                                >
                                    {refreshing ? <CircularProgress size={20} sx={{ color: '#243b64' }} /> : 'Refresh Status'}
                                </Button>
                            </Stack>

                            <TableContainer
                                sx={{
                                    borderRadius: '14px',
                                    border: '1px solid rgba(95, 130, 200, 0.16)',
                                    overflow: 'hidden',
                                }}
                            >
                                <Table size="medium">
                                    <TableHead>
                                        <TableRow
                                            sx={{
                                                background: 'linear-gradient(90deg, #5f82c8 0%, #7ea4f3 100%)',
                                            }}
                                        >
                                            <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', py: 1.75, borderBottom: 'none' }}>
                                                Date
                                            </TableCell>
                                            <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', py: 1.75, borderBottom: 'none' }}>
                                                Reason
                                            </TableCell>
                                            <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', py: 1.75, borderBottom: 'none' }}>
                                                Status
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {requests.length > 0 ? (
                                            requests.map((r) => (
                                                <TableRow
                                                    key={r._id}
                                                    hover
                                                    sx={{ '&:last-of-type td': { borderBottom: 0 }, '&:nth-of-type(even)': { backgroundColor: 'rgba(95, 130, 200, 0.04)' } }}
                                                >
                                                    <TableCell sx={{ fontWeight: 600, color: '#243b64', verticalAlign: 'top' }}>
                                                        {r.fromDate && r.toDate
                                                            ? `${formatDate(r.fromDate)} - ${formatDate(r.toDate)}`
                                                            : formatDate(r.date)}
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'rgba(36, 59, 100, 0.88)', maxWidth: { xs: 160, sm: 320 } }}>
                                                        {r.reason}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={r.status}
                                                            color={statusColor(r.status)}
                                                            size="small"
                                                            sx={{ fontWeight: 700 }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ py: 5, borderBottom: 'none' }}>
                                                    <Typography sx={{ color: 'rgba(36, 59, 100, 0.55)', fontWeight: 600, fontSize: '1rem' }}>
                                                        No leave requests found
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
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default StudentComplain;
