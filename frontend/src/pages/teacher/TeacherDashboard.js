import { useEffect, useState } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
} from '@mui/material';
import Badge from '@mui/material/Badge';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TeacherSideBar from './TeacherSideBar';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Logout from '../Logout'
import AccountMenu from '../../components/AccountMenu';
import { AppBar, Drawer } from '../../components/styles';
import TeacherHomePage from './TeacherHomePage';
import TeacherClassDetails from './TeacherClassDetails';
import TeacherMonthlyReport from './TeacherMonthlyReport';
import TeacherLeaveRequests from './TeacherLeaveRequests';
import TeacherProfile from './TeacherProfile';
import { useDispatch, useSelector } from 'react-redux';
import { authLogout } from '../../redux/userRelated/userSlice';
import axios from 'axios';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const token = currentUser?.token;

    const [pendingLeaves, setPendingLeaves] = useState(0);

    const [open, setOpen] = useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    useEffect(() => {
        // Old sessions may exist without token. Force re-login for protected API usage.
        if (currentUser && !currentUser.token) {
            dispatch(authLogout());
            navigate('/Teacherlogin');
        }
    }, [currentUser, dispatch, navigate]);

    useEffect(() => {
        const fetchPendingLeaves = async () => {
            if (!token) return;
            try {
                const base = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
                let rows = [];
                try {
                    const res = await axios.get(`${base}/api/leave/requests`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    rows = Array.isArray(res.data) ? res.data : [];
                } catch {
                    const resAlt = await axios.get(`${base}/api/leave`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    rows = Array.isArray(resAlt.data) ? resAlt.data : [];
                }
                const pendingCount = rows.filter((r) => String(r.status || '').toLowerCase() === 'pending').length;
                setPendingLeaves(pendingCount);
            } catch {
                setPendingLeaves(0);
            }
        };
        fetchPendingLeaves();
        const id = setInterval(fetchPendingLeaves, 15000);
        return () => clearInterval(id);
    }, [token]);

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar
                    open={open}
                    position='absolute'
                    sx={{
                        background: 'linear-gradient(90deg, #0d5f5d 0%, #0f8f86 100%)',
                        boxShadow: '0 8px 22px rgba(13, 95, 93, 0.32)',
                    }}
                >
                    <Toolbar sx={{ pr: '24px' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h4"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1, fontWeight: 900, fontSize: { xs: '1.7rem', md: '2rem' }, lineHeight: 1.3 }}
                        >
                            Teacher Dashboard
                        </Typography>
                        <IconButton
                            color="inherit"
                            aria-label="leave requests"
                            onClick={() => navigate('/Teacher/leave-requests')}
                            sx={{ mr: 1 }}
                        >
                            <Badge badgeContent={pendingLeaves} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <AccountMenu />
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    open={open}
                    sx={{
                        ...(open ? styles.drawerStyled : styles.hideDrawer),
                        '& .MuiDrawer-paper': {
                            background: 'linear-gradient(180deg, #0b3d3a 0%, #0f4f4a 100%)',
                            borderRight: '1px solid #1c615b',
                            color: '#e9fffa',
                        },
                    }}
                >
                    <Toolbar sx={styles.toolBarStyled}>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List component="nav">
                        <TeacherSideBar />
                    </List>
                </Drawer>
                <Box component="main" sx={styles.boxStyled}>
                    <Toolbar />
                    <Routes>
                        <Route path="/" element={<TeacherHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/teacher/dashboard" element={<TeacherHomePage />} />
                        <Route path="/Teacher/dashboard" element={<TeacherHomePage />} />
                        <Route path="/Teacher/class" element={<TeacherClassDetails />} />
                        <Route path="/Teacher/monthly-report" element={<TeacherMonthlyReport />} />
                        <Route path="/Teacher/leave-requests" element={<TeacherLeaveRequests />} />
                        <Route path="/Teacher/profile" element={<TeacherProfile />} />
                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
}

export default TeacherDashboard

const styles = {
    boxStyled: {
        background: 'linear-gradient(180deg, #f3fffc 0%, #ecf9f6 100%)',
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        padding: { xs: 1.5, md: 2.4 },
        '& .MuiTypography-root': {
            fontSize: '1.06rem',
        },
        '& .MuiPaper-root, & .MuiCard-root': {
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 10px 24px rgba(5, 53, 49, 0.11)',
        },
    },
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: [1],
    },
    drawerStyled: {
        display: "flex"
    },
    hideDrawer: {
        display: 'flex',
        '@media (max-width: 600px)': {
            display: 'none',
        },
    },
}