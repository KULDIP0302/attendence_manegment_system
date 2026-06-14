import React, { useEffect } from 'react';
import axios from 'axios';
import * as ReactState from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import TableTemplate from '../../../components/TableTemplate';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import DeleteConfirmDialog from '../../../components/admin/DeleteConfirmDialog';
import Popup from '../../../components/Popup';

const ShowSubjects = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { subjectsList, loading } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);

    const [confirmOpen, setConfirmOpen] = ReactState.useState(false);
    const [deleteId, setDeleteId] = ReactState.useState(null);
    const [deleteLoading, setDeleteLoading] = ReactState.useState(false);
    const [message, setMessage] = ReactState.useState("");
    const [showPopup, setShowPopup] = ReactState.useState(false);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getSubjectList(currentUser._id, "AllSubjects"));
        }
    }, [currentUser?._id, dispatch]);

    const subjectColumns = [
        { id: 'subName', label: 'Sub Name', minWidth: 170 },
        { id: 'sessions', label: 'Sessions', minWidth: 120 },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
    ];

    const subjectRows = Array.isArray(subjectsList)
        ? subjectsList.map((subject) => ({
            subName: subject.subName,
            sessions: subject.sessions,
            sclassName: subject?.sclassName?.sclassName || "N/A",
            sclassID: subject?.sclassName?._id,
            id: subject._id,
        }))
        : [];

    const SubjectsButtonHaver = ({ row }) => {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <IconButton
                    onClick={() => {
                        setDeleteId(row.id);
                        setConfirmOpen(true);
                    }}
                    color="error"
                    aria-label="delete subject"
                >
                    <DeleteOutlineIcon />
                </IconButton>
                <BlueButton
                    variant="contained"
                    onClick={() => navigate(`/Admin/subjects/subject/${row.sclassID}/${row.id}`)}
                >
                    View
                </BlueButton>
                <GreenButton
                    variant="contained"
                    onClick={() => navigate(`/Admin/subjects/edit/${row.id}`)}
                >
                    Edit
                </GreenButton>
            </Box>
        );
    };

    const handleConfirmDelete = async () => {
        if (!deleteId || !currentUser?._id) return;
        setDeleteLoading(true);

        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL || "http://localhost:5000"}/Subject/${deleteId}`);
            dispatch(getSubjectList(currentUser._id, "AllSubjects"));
            setConfirmOpen(false);
        } catch (err) {
            setMessage(err?.response?.data?.message || "Error deleting subject");
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
                            onClick={() => navigate("/Admin/subjects/chooseclass")}
                        >
                            Add Subjects
                        </GreenButton>
                    </Box>

                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        {subjectRows.length > 0 ? (
                            <TableTemplate
                                buttonHaver={SubjectsButtonHaver}
                                columns={subjectColumns}
                                rows={subjectRows}
                                headerFontSize="1.24rem"
                                bodyFontSize="1.15rem"
                            />
                        ) : (
                            <Box sx={{ p: 3 }}>
                                <Typography variant="h6">No subjects found</Typography>
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
                title="Delete Subject"
                description="Are you sure you want to delete?"
            />

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ShowSubjects;