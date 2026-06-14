import { useState } from 'react';
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
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppBar, Drawer } from '../../components/styles';
import Logout from '../Logout';
import SideBar from './SideBar';
import AdminProfile from './AdminProfile';
import AdminHomePage from './AdminHomePage';

import AddStudent from './studentRelated/AddStudent';
import ShowStudents from './studentRelated/ShowStudents';
import StudentAttendance from './studentRelated/StudentAttendance';
import StudentExamMarks from './studentRelated/StudentExamMarks';
import ViewStudent from './studentRelated/ViewStudent';

import ShowSubjects from './subjectRelated/ShowSubjects';
import AddSubject from './subjectRelated/AddSubject';
import SubjectForm from './subjectRelated/SubjectForm';
import EditSubject from './subjectRelated/EditSubject';
import ViewSubject from './subjectRelated/ViewSubject';

import AddTeacher from './teacherRelated/AddTeacher';
import ChooseClass from './teacherRelated/ChooseClass';
import ChooseSubject from './teacherRelated/ChooseSubject';
import ShowTeachers from './teacherRelated/ShowTeachers';
import TeacherDetails from './teacherRelated/TeacherDetails';

import AddClass from './classRelated/AddClass';
import ClassDetails from './classRelated/ClassDetails';
import ShowClasses from './classRelated/ShowClasses';
import AccountMenu from '../../components/AccountMenu';

const AdminDashboard = () => {
    const [open, setOpen] = useState(false);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar
                    open={open}
                    position='absolute'
                    sx={{
                        background: 'linear-gradient(90deg, #0f1f4d 0%, #1f3b9d 100%)',
                        boxShadow: '0 8px 22px rgba(15, 31, 77, 0.35)',
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
                            sx={{ flexGrow: 1, fontWeight: 900, fontSize: { xs: '1.9rem', md: '2.2rem' }, lineHeight: 1.25 }}
                        >
                            Admin Dashboard
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
                            background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                            borderRight: '1px solid #1f2f4d',
                            color: '#e7eeff',
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
                        <SideBar />
                    </List>
                </Drawer>
                <Box component="main" sx={styles.boxStyled}>
                    <Toolbar />
                    <Routes>
                        <Route path="/" element={<AdminHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Admin/dashboard" element={<AdminHomePage />} />
                        <Route path="/Admin/reports" element={<AdminHomePage />} />
                        <Route path="/Admin/profile" element={<AdminProfile />} />

                        {/* Subject management (inside Admin) */}
                        <Route path="/Admin/subjects" element={<ShowSubjects />} />
                        <Route path="/Admin/add-subject" element={<AddSubject />} />
                        <Route path="/admin/add-subject" element={<AddSubject />} />
                        <Route path="/Admin/subjects/edit/:subjectID" element={<EditSubject />} />
                        <Route path="/Admin/subjects/subject/:classID/:subjectID" element={<ViewSubject />} />
                        <Route path="/Admin/subjects/chooseclass" element={<ChooseClass situation="Subject" />} />

                        <Route path="/Admin/addsubject/:id" element={<SubjectForm />} />
                        <Route path="/Admin/class/subject/:classID/:subjectID" element={<ViewSubject />} />

                        <Route path="/Admin/subject/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
                        <Route path="/Admin/subject/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />

                        {/* Class */}
                        <Route path="/Admin/addclass" element={<AddClass />} />
                        <Route path="/Admin/classes" element={<ShowClasses />} />
                        <Route path="/Admin/classes/class/:id" element={<ClassDetails />} />
                        <Route path="/Admin/class/addstudents/:id" element={<AddStudent situation="Class" />} />

                        {/* Student */}
                        <Route path="/Admin/addstudents" element={<AddStudent situation="Student" />} />
                        <Route path="/Admin/students" element={<ShowStudents />} />
                        <Route path="/Admin/students/student/:id" element={<ViewStudent />} />
                        <Route path="/Admin/students/student/attendance/:id" element={<StudentAttendance situation="Student" />} />
                        <Route path="/Admin/students/student/marks/:id" element={<StudentExamMarks situation="Student" />} />

                        {/* Teacher */}
                        <Route path="/Admin/teachers" element={<ShowTeachers />} />
                        <Route path="/Admin/teachers/teacher/:id" element={<TeacherDetails />} />
                        <Route path="/Admin/teachers/chooseclass" element={<ChooseClass situation="Teacher" />} />
                        <Route path="/Admin/teachers/choosesubject/:id" element={<ChooseSubject situation="Norm" />} />
                        <Route path="/Admin/teachers/choosesubject/:classID/:teacherID" element={<ChooseSubject situation="Teacher" />} />
                        <Route path="/Admin/teachers/addteacher/:id" element={<AddTeacher />} />

                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
}

export default AdminDashboard

const styles = {
    boxStyled: {
        background: 'linear-gradient(180deg, #f3f6ff 0%, #eef3ff 100%)',
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        padding: { xs: 1.5, md: 2.4 },
        '& .MuiTypography-root': {
            fontSize: '1.12rem',
        },
        '& .MuiButton-root': {
            fontSize: '1.08rem',
        },
        '& .MuiTableCell-root': {
            fontSize: '1.08rem',
        },
        '& .MuiInputBase-input, & .MuiInputLabel-root, & .MuiFormHelperText-root, & .MuiMenuItem-root': {
            fontSize: '1.08rem',
        },
        '& .MuiPaper-root, & .MuiCard-root': {
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 10px 24px rgba(15, 23, 42, 0.1)',
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