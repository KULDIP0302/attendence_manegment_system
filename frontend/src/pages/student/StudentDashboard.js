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
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import StudentSideBar from './StudentSideBar';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import StudentHomePage from './StudentHomePage';
import StudentProfile from './StudentProfile';
import StudentSubjects from './StudentSubjects';
import ViewStdAttendance from './ViewStdAttendance';
import StudentComplain from './StudentComplain';
import Logout from '../Logout'
import AccountMenu from '../../components/AccountMenu';
import { AppBar, Drawer } from '../../components/styles';
import { useDispatch, useSelector } from 'react-redux';
import { authLogout } from '../../redux/userRelated/userSlice';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);

    const [open, setOpen] = useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    useEffect(() => {
        if (currentUser && !currentUser.token) {
            dispatch(authLogout());
            navigate('/Studentlogin');
        }
    }, [currentUser, dispatch, navigate]);

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar
                    open={open}
                    position='absolute'
                    sx={{
                        background: 'linear-gradient(90deg, #5f82c8 0%, #7ea4f3 100%)',
                        boxShadow: '0 8px 22px rgba(95, 130, 200, 0.3)',
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
                            Student Dashboard
                        </Typography>
                        <AccountMenu />
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    open={open}
                    sx={{
                        ...(open ? styles.drawerStyled : styles.hideDrawer),
                        '& .MuiDrawer-paper': {
                            background: 'linear-gradient(180deg, #243b64 0%, #304b7c 100%)',
                            borderRight: '1px solid #395888',
                            color: '#eef5ff',
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
                        <StudentSideBar />
                    </List>
                </Drawer>
                <Box component="main" sx={styles.boxStyled}>
                    <Toolbar />
                    <Routes>
                        <Route path="/" element={<StudentHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Student/dashboard" element={<StudentHomePage />} />
                        <Route path="/Student/profile" element={<StudentProfile />} />

                        <Route path="/Student/subjects" element={<StudentSubjects />} />
                        <Route path="/Student/attendance" element={<ViewStdAttendance />} />
                        <Route path="/Student/leave-request" element={<StudentComplain />} />

                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
}

export default StudentDashboard

const styles = {
    boxStyled: {
        background: 'linear-gradient(180deg, #f8fbff 0%, #f2f7ff 100%)',
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
            boxShadow: '0 10px 24px rgba(28, 60, 112, 0.1)',
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