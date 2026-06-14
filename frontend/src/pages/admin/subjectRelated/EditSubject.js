import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Button, Card, CardContent, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import Popup from '../../../components/Popup';

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

const EditSubject = () => {
    const navigate = useNavigate();
    const { subjectID } = useParams();
    const { currentUser } = useSelector((state) => state.user);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [form, setForm] = useState({
        subName: '',
        sclassName: '',
        teacher: '',
    });

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const adminId = currentUser?._id;
                const [subjectRes, classesRes, teachersRes] = await Promise.all([
                    axios.get(`${BASE_URL}/Subject/${subjectID}`),
                    axios.get(`${BASE_URL}/SclassList/${adminId}`),
                    axios.get(`${BASE_URL}/Teachers/${adminId}`),
                ]);

                const subject = subjectRes.data || {};
                setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
                setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
                setForm({
                    subName: subject.subName || '',
                    sclassName: subject?.sclassName?._id || '',
                    teacher: subject?.teacher?._id || '',
                });
            } catch (err) {
                setMessage(err?.response?.data?.message || 'Failed to load subject data');
                setShowPopup(true);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [subjectID, currentUser?._id]);

    const handleUpdate = async (event) => {
        event.preventDefault();
        if (!form.subName || !form.sclassName) {
            setMessage('Subject name and class are required');
            setShowPopup(true);
            return;
        }

        setSaving(true);
        try {
            await axios.put(`${BASE_URL}/Subject/${subjectID}`, {
                subName: form.subName,
                sclassName: form.sclassName,
                teacher: form.teacher || null,
            });
            navigate(-1);
        } catch (err) {
            setMessage(err?.response?.data?.message || 'Failed to update subject');
            setShowPopup(true);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, px: 2 }}>
                <Card sx={{ width: '100%', maxWidth: 760, borderRadius: 3, boxShadow: 4 }}>
                    <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                        <Stack spacing={2.5}>
                            <Typography sx={{ fontSize: { xs: '1.45rem', md: '1.9rem' }, fontWeight: 900 }}>
                                Edit Subject
                            </Typography>

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Box component="form" onSubmit={handleUpdate}>
                                    <Stack spacing={2.5}>
                                        <TextField
                                            label="Subject Name"
                                            value={form.subName}
                                            onChange={(e) => setForm((prev) => ({ ...prev, subName: e.target.value }))}
                                            fullWidth
                                            required
                                        />
                                        <TextField
                                            select
                                            label="Class"
                                            value={form.sclassName}
                                            onChange={(e) => setForm((prev) => ({ ...prev, sclassName: e.target.value }))}
                                            fullWidth
                                            required
                                        >
                                            {classes.map((c) => (
                                                <MenuItem key={c._id} value={c._id}>
                                                    {c.sclassName}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                        <TextField
                                            select
                                            label="Teacher"
                                            value={form.teacher}
                                            onChange={(e) => setForm((prev) => ({ ...prev, teacher: e.target.value }))}
                                            fullWidth
                                        >
                                            <MenuItem value="">Unassigned</MenuItem>
                                            {teachers.map((t) => (
                                                <MenuItem key={t._id} value={t._id}>
                                                    {t.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                        <Button type="submit" variant="contained" disabled={saving}>
                                            {saving ? <CircularProgress size={24} color="inherit" /> : 'Update'}
                                        </Button>
                                    </Stack>
                                </Box>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default EditSubject;
