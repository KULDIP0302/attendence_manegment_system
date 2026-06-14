import React, { useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useDispatch, useSelector } from 'react-redux';
import { getClassStudents } from '../../redux/sclassRelated/sclassHandle';
import axios from 'axios';

const SummaryCard = ({ title, value, icon }) => (
    <Paper
        elevation={3}
        sx={{
            p: 3,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 130,
        }}
    >
        <Box>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1, fontWeight: 700, fontSize: { xs: '1.2rem', md: '1.35rem' } }}>
                {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', md: '2rem' } }}>
                {value}
            </Typography>
        </Box>
        <Box sx={{ color: 'primary.main' }}>{icon}</Box>
    </Paper>
);

const TeacherHomePage = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { sclassStudents } = useSelector((state) => state.sclass);

    const classID = currentUser?.teachSclass?._id;
    const token = currentUser?.token;
    const [selectedDate] = React.useState(() => {
        const d = new Date();
        const local = new Date(d);
        local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
        return local.toISOString().slice(0, 10);
    });
    const [summary, setSummary] = React.useState({ present: 0, absent: 0 });

    useEffect(() => {
        if (classID) dispatch(getClassStudents(classID));
    }, [dispatch, classID]);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!classID || !token) return;
            try {
                const base = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
                const res = await axios.get(`${base}/api/attendance/class/${classID}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { date: selectedDate },
                });
                const s = res.data?.summary || { present: 0, absent: 0 };
                setSummary({ present: s.present || 0, absent: s.absent || 0 });
            } catch {
                setSummary({ present: 0, absent: 0 });
            }
        };
        fetchSummary();
    }, [classID, token, selectedDate]);

    const totalStudents = Array.isArray(sclassStudents) ? sclassStudents.length : 0;
    const totalClassesAssigned = currentUser?.teachSclass ? 1 : 0;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 3, fontSize: { xs: '1.9rem', md: '2.2rem' } }}>
                Teacher Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <SummaryCard
                        title="Total Classes Assigned"
                        value={totalClassesAssigned}
                        icon={<ClassOutlinedIcon sx={{ fontSize: 44 }} />}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <SummaryCard
                        title="Total Students (Class)"
                        value={totalStudents}
                        icon={<GroupsIcon sx={{ fontSize: 44 }} />}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <SummaryCard
                        title="Present Count"
                        value={summary.present}
                        icon={<DoneAllIcon sx={{ fontSize: 44 }} />}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <SummaryCard
                        title="Absent Count"
                        value={summary.absent}
                        icon={<HighlightOffIcon sx={{ fontSize: 44 }} />}
                    />
                </Grid>
            </Grid>
        </Container>
    );
};

export default TeacherHomePage;