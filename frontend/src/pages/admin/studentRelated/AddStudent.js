import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    TextField,
    Typography,
    MenuItem,
} from '@mui/material';

const AddStudent = ({ situation }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, tempDetails } = userState;
    const { sclassesList } = useSelector((state) => state.sclass);

    const [formData, setFormData] = useState({
        className: '',
        sclassName: '',
        name: '',
        email: '',
        password: '',
    });

    const adminID = currentUser._id
    const role = "Student"

    useEffect(() => {
        if (situation === "Class") {
            const selectedClass = sclassesList.find((item) => item._id === params.id);
            setFormData((prev) => ({
                ...prev,
                sclassName: params.id || '',
                className: selectedClass?.sclassName || prev.className,
            }));
        }
    }, [params.id, situation, sclassesList]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)
    const [previewRollNum, setPreviewRollNum] = useState('');

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    const calculateNextRoll = (students) => {
        const yearPrefix = Number(String(new Date().getFullYear()).slice(-2));
        const start = yearPrefix * 100;
        const end = start + 99;
        const classRolls = (Array.isArray(students) ? students : [])
            .map((s) => Number(s?.rollNum))
            .filter((n) => Number.isInteger(n) && n >= start && n <= end);
        const maxRoll = classRolls.length > 0 ? Math.max(...classRolls) : start;
        const next = maxRoll + 1;
        if (next > end) return '';
        return String(next);
    };

    const fetchPreviewRollNum = async (classId) => {
        if (!classId) {
            setPreviewRollNum('');
            return;
        }
        try {
            const base = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
            const res = await axios.get(`${base}/Sclass/Students/${classId}`);
            setPreviewRollNum(calculateNextRoll(res.data));
        } catch {
            setPreviewRollNum('');
        }
    };

    useEffect(() => {
        if (formData.sclassName) {
            fetchPreviewRollNum(formData.sclassName);
        } else {
            setPreviewRollNum('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.sclassName]);

    const validateForm = () => {
        const { className, sclassName, name, email, password } = formData;
        if (!sclassName) return 'Please select a class';
        if (!String(name).trim()) return 'Name is required';
        if (!String(email).trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(email).toLowerCase().trim())) return 'Please enter a valid email';
        const passwordLength = String(password).length;
        if (!password) return 'Password is required';
        if (passwordLength < 6) return 'Password must be at least 6 characters';
        if (!className || !sclassName || !name || !email || !password) return 'All fields are required';
        return '';
    };

    const fields = {
        name: String(formData.name).trim(),
        email: String(formData.email).trim().toLowerCase(),
        password: formData.password,
        sclassName: formData.sclassName,
        adminID,
        role,
    };

    const submitHandler = (event) => {
        event.preventDefault()
        const validationError = validateForm();
        if (validationError) {
            setMessage(validationError);
            setShowPopup(true);
            return;
        }

        setLoader(true)
        dispatch(registerUser(fields, role))
    }

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl())
            setLoader(false)
            navigate('/Admin/students', {
                state: { successMessage: `Student added successfully (Roll No: ${tempDetails?.rollNum || previewRollNum || '-'})` },
            });
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setMessage("Network Error")
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, response, dispatch, tempDetails, previewRollNum]);

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, px: 2 }}>
                <Card sx={{ width: '100%', maxWidth: 760, borderRadius: 3, boxShadow: 4 }}>
                    <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                        <Stack spacing={2.5}>
                            <Typography sx={{ fontSize: { xs: '1.45rem', md: '1.9rem' }, fontWeight: 900 }}>
                                Add Student
                            </Typography>

                            <Box component="form" onSubmit={submitHandler}>
                                <Stack spacing={2.5}>
                                    {situation === 'Class' ? (
                                        <TextField
                                            label="Class"
                                            value={formData.className}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                        />
                                    ) : (
                                        <TextField
                                            select
                                            label="Class"
                                            value={formData.sclassName}
                                            onChange={(event) => {
                                                const selectedClass = sclassesList.find((item) => item._id === event.target.value);
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    sclassName: event.target.value,
                                                    className: selectedClass?.sclassName || '',
                                                }));
                                            }}
                                            fullWidth
                                            required
                                        >
                                            {sclassesList.map((classItem) => (
                                                <MenuItem key={classItem._id} value={classItem._id}>
                                                    {classItem.sclassName}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}

                                    <TextField
                                        label="Roll Number"
                                        fullWidth
                                        value={previewRollNum || 'Auto-generated'}
                                        InputProps={{ readOnly: true }}
                                        helperText="Class select કરતાં next roll number auto-preview થશે."
                                    />
                                    <TextField
                                        label="Student Name"
                                        value={formData.name}
                                        onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                                        fullWidth
                                        required
                                    />
                                    <TextField
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                                        fullWidth
                                        required
                                    />
                                    <TextField
                                        label="Password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                                        fullWidth
                                        required
                                    />
                                    <Button type="submit" variant="contained" disabled={loader}>
                                        {loader ? <CircularProgress size={24} color="inherit" /> : 'Save Student'}
                                    </Button>
                                </Stack>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    )
}

export default AddStudent