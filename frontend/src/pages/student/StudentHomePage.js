import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Container, Grid, Stack, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import axios from 'axios';

const StudentHomePage = () => {
    const dispatch = useDispatch();

    const { currentUser } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);
    const studentId = currentUser?._id || currentUser?.id;
    const token = currentUser?.token;

    const [attendanceRows, setAttendanceRows] = useState([]);

    const classID = currentUser?.sclassName?._id

    useEffect(() => {
        dispatch(getSubjectList(classID, "ClassSubjects"));

        const fetchAttendance = async () => {
            if (!studentId || !token) return;
            try {
                const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
                const res = await axios.get(`${BASE_URL}/api/attendance/student/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAttendanceRows(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                setAttendanceRows([]);
            }
        };

        if (studentId) fetchAttendance();
    }, [dispatch, studentId, classID, token]);

    const numberOfSubjects = subjectsList?.length || 0;
    const presentCount = useMemo(
        () => attendanceRows.filter((r) => r.status === 'Present').length,
        [attendanceRows]
    );
    const absentCount = useMemo(
        () => attendanceRows.filter((r) => r.status === 'Absent').length,
        [attendanceRows]
    );
    const StatCard = ({ title, value, icon, color }) => (
        <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, fontWeight: 700, color: 'text.secondary' }}>
                            {title}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '1.9rem', md: '2.1rem' }, fontWeight: 900, color }}>
                            {value}
                        </Typography>
                    </Box>
                    <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
                        {icon}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Stack spacing={3}>
                <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 900, color: '#1f3b9d' }}>
                    Student Dashboard
                </Typography>
                <Typography sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, fontWeight: 700, color: 'text.secondary' }}>
                    Roll Number: {currentUser?.rollNum ?? currentUser?.rollNumber ?? 'N/A'}
                </Typography>

                <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Total Subjects"
                            value={numberOfSubjects}
                            color="#1f3b9d"
                            icon={<ClassOutlinedIcon sx={{ fontSize: 44 }} />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Present Days"
                            value={presentCount}
                            color="#1b5e20"
                            icon={<CheckCircleOutlinedIcon sx={{ fontSize: 44 }} />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Absent Days"
                            value={absentCount}
                            color="#c62828"
                            icon={<HighlightOffOutlinedIcon sx={{ fontSize: 44 }} />}
                        />
                    </Grid>
                </Grid>

            </Stack>
        </Container>
    );
};

export default StudentHomePage