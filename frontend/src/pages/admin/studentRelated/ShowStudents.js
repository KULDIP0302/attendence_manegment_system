import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import {
    Paper, Box
} from '@mui/material';
import Typography from '@mui/material/Typography';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import * as React from 'react';
import DeleteConfirmDialog from '../../../components/admin/DeleteConfirmDialog';
import Popup from '../../../components/Popup';

const ShowStudents = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch();
    const { studentsList, loading } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user)

    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState(null);
    const [deleteLoading, setDeleteLoading] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const [showPopup, setShowPopup] = React.useState(false);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getAllStudents(currentUser._id));
        }
    }, [currentUser?._id, dispatch]);

    useEffect(() => {
        const stateMessage = location.state?.successMessage;
        if (stateMessage) {
            setMessage(stateMessage);
            setShowPopup(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.pathname, location.state, navigate]);

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
        { id: 'email', label: 'Email', minWidth: 180 },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
    ]

    const studentRows = studentsList && studentsList.length > 0 && studentsList.map((student) => {
        const rollNumber = student.rollNum ?? student.rollNumber ?? student.studentNumber ?? '';
        return {
            name: student.name,
            rollNum: rollNumber,
            email: student.email || '-',
            sclassName: student.sclassName.sclassName,
            id: student._id,
        };
    })

    const StudentButtonHaver = ({ row }) => {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <IconButton
                    onClick={() => {
                        setDeleteId(row.id);
                        setConfirmOpen(true);
                    }}
                    color="error"
                    aria-label="delete student"
                >
                    <DeleteOutlineIcon />
                </IconButton>
                <BlueButton
                    variant="contained"
                    onClick={() => navigate("/Admin/students/student/" + row.id)}
                >
                    View
                </BlueButton>
            </Box>
        );
    };

    const handleConfirmDelete = async () => {
        if (!deleteId || !currentUser?._id) return;

        setDeleteLoading(true);
        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL || "http://localhost:5000"}/Student/${deleteId}`);
            // Refresh after successful deletion
            dispatch(getAllStudents(currentUser._id));
            setConfirmOpen(false);
        } catch (err) {
            const apiMessage = err?.response?.data?.message || 'Error deleting student';
            setMessage(apiMessage);
            setShowPopup(true);
            setConfirmOpen(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 2 }}>
                        <GreenButton
                            variant="contained"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={() => navigate("/Admin/addstudents")}
                        >
                            Add Student
                        </GreenButton>
                    </Box>

                    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3, boxShadow: 3 }}>
                        {Array.isArray(studentsList) && studentsList.length > 0 ? (
                            <TableTemplate
                                buttonHaver={StudentButtonHaver}
                                columns={studentColumns}
                                rows={studentRows}
                                showPagination={false}
                                headerFontSize="1.24rem"
                                bodyFontSize="1.15rem"
                            />
                        ) : (
                            <Box sx={{ p: 3 }}>
                                <Typography variant="h6">No students found</Typography>
                            </Box>
                        )}
                    </Paper>
                </>
            )}
            <DeleteConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                loading={deleteLoading}
                onConfirm={handleConfirmDelete}
                title="Delete Student"
                description="Are you sure you want to delete?"
            />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ShowStudents;