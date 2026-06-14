import React, { useEffect } from 'react';
import axios from 'axios';
import * as ReactState from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import DeleteConfirmDialog from '../../../components/admin/DeleteConfirmDialog';
import Popup from '../../../components/Popup';

const ShowTeachers = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { teachersList, loading } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);

    const [confirmOpen, setConfirmOpen] = ReactState.useState(false);
    const [deleteId, setDeleteId] = ReactState.useState(null);
    const [deleteLoading, setDeleteLoading] = ReactState.useState(false);
    const [message, setMessage] = ReactState.useState('');
    const [showPopup, setShowPopup] = ReactState.useState(false);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getAllTeachers(currentUser._id));
        }
    }, [currentUser?._id, dispatch]);

    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'teachSubject', label: 'Subject', minWidth: 170 },
        { id: 'teachSclass', label: 'Class', minWidth: 170 },
    ];

    const rows = Array.isArray(teachersList)
        ? teachersList.map((teacher) => ({
            name: teacher.name,
            teachSubject: teacher.teachSubject?.subName || null,
            teachSclass: teacher.teachSclass?.sclassName || null,
            teachSclassID: teacher.teachSclass?._id || null,
            id: teacher._id,
        }))
        : [];

    const TeacherButtonHaver = ({ row }) => {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                {!row.teachSubject ? (
                    <GreenButton
                        variant="contained"
                        onClick={() => navigate(`/Admin/teachers/choosesubject/${row.teachSclassID}/${row.id}`)}
                        disabled={!row.teachSclassID}
                    >
                        Add Subject
                    </GreenButton>
                ) : null}

                <BlueButton
                    variant="contained"
                    onClick={() => navigate(`/Admin/teachers/teacher/${row.id}`)}
                >
                    View
                </BlueButton>

                <IconButton
                    onClick={() => {
                        setDeleteId(row.id);
                        setConfirmOpen(true);
                    }}
                    color="error"
                    aria-label="delete teacher"
                >
                    <DeleteOutlineIcon />
                </IconButton>
            </Box>
        );
    };

    const handleConfirmDelete = async () => {
        if (!deleteId || !currentUser?._id) return;

        setDeleteLoading(true);
        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/Teacher/${deleteId}`);
            dispatch(getAllTeachers(currentUser._id));
            setConfirmOpen(false);
        } catch (err) {
            setMessage(err?.response?.data?.message || 'Error deleting teacher');
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
                            onClick={() => navigate('/Admin/teachers/chooseclass')}
                        >
                            Add Teacher
                        </GreenButton>
                    </Box>

                    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3, boxShadow: 3 }}>
                        {rows.length > 0 ? (
                            <TableTemplate
                                buttonHaver={TeacherButtonHaver}
                                columns={columns}
                                rows={rows}
                                headerFontSize="1.24rem"
                                bodyFontSize="1.15rem"
                            />
                        ) : (
                            <Box sx={{ p: 3 }}>
                                <Typography variant="h6">No teachers found</Typography>
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
                title="Delete Teacher"
                description="Are you sure you want to delete?"
            />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ShowTeachers;