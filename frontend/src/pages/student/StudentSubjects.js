import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import {
    Card,
    CardContent,
    Chip,
    Container,
    Grid,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

const StudentSubjects = () => {
    const dispatch = useDispatch();
    const { subjectsList, sclassDetails } = useSelector((state) => state.sclass);
    const { currentUser, loading, response, error } = useSelector((state) => state.user);
    const classId = currentUser?.sclassName?._id;

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getUserDetails(currentUser._id, "Student"));
        }
    }, [dispatch, currentUser?._id]);

    if (response) { console.log(response) }
    else if (error) { console.log(error) }

    useEffect(() => {
        if (classId) {
            dispatch(getSubjectList(classId, "ClassSubjects"));
        }
    }, [classId, dispatch]);

    return (
        <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
            {loading ? (
                <Typography>Loading...</Typography>
            ) : (
                <Stack spacing={2.5}>
                    <Typography sx={{ fontSize: { xs: '1.9rem', md: '2.2rem' }, fontWeight: 900 }}>
                        My Subjects
                    </Typography>

                    <Paper sx={{ p: 2.25, borderRadius: 3, boxShadow: 3 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
                            <Stack direction="row" spacing={1.25} alignItems="center">
                                <SchoolRoundedIcon color="primary" />
                                <Typography sx={{ fontSize: { xs: '1.05rem', md: '1.2rem' }, fontWeight: 800 }}>
                                    Class: {sclassDetails?.sclassName || currentUser?.sclassName?.sclassName || '-'}
                                </Typography>
                            </Stack>
                            <Chip
                                icon={<MenuBookRoundedIcon />}
                                label={`Total Subjects: ${Array.isArray(subjectsList) ? subjectsList.length : 0}`}
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 700, fontSize: '0.95rem' }}
                            />
                        </Stack>
                    </Paper>

                    <Grid container spacing={2}>
                        {Array.isArray(subjectsList) && subjectsList.length > 0 ? subjectsList.map((subject) => (
                            <Grid item xs={12} sm={6} md={4} key={subject._id || subject.subName}>
                                <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
                                    <CardContent>
                                        <Typography sx={{ fontSize: '1.12rem', fontWeight: 800 }}>
                                            {subject.subName}
                                        </Typography>
                                        <Typography sx={{ mt: 0.5, color: 'text.secondary', fontWeight: 600 }}>
                                            Code: {subject.subCode || 'N/A'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )) : (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                                    <Typography>No subjects found for your class.</Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>

                </Stack>
            )}
        </Container>
    );
};

export default StudentSubjects;