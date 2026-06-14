import React, { useEffect, useState } from "react";
import { Button, TextField, Grid, Box, Typography, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';

const SubjectForm = () => {

    const [subjects, setSubjects] = useState([
        { subName: "", sessions: "" }
    ]);

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;

    const sclassName = params.id
    const adminID = currentUser?._id   // safe access
    const address = "Subject"          // ✅ FIX HERE

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    const handleSubjectNameChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].subName = event.target.value;
        setSubjects(newSubjects);
    };

    const handleSessionsChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].sessions = event.target.value || 0;
        setSubjects(newSubjects);
    };

    const handleAddSubject = () => {
        setSubjects([...subjects, { subName: "", sessions: "" }]);
    };

    const handleRemoveSubject = (index) => () => {
        const newSubjects = [...subjects];
        newSubjects.splice(index, 1);
        setSubjects(newSubjects);
    };

    const fields = {
        sclassName,
        subjects: subjects.map((subject) => ({
            subName: subject.subName,
            sessions: subject.sessions,
        })),
        adminID,
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === 'added') {
            navigate("/Admin/subjects");
            dispatch(underControl())
            setLoader(false)
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
    }, [status, navigate, error, response, dispatch]);

    return (
        <form onSubmit={submitHandler}>
            <Box mb={2}>
                <Typography variant="h6">Add Subjects</Typography>
            </Box>

            <Grid container spacing={2}>
                {subjects.map((subject, index) => (
                    <React.Fragment key={index}>

                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Subject Name"
                                variant="outlined"
                                value={subject.subName}
                                onChange={handleSubjectNameChange(index)}
                                required
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Sessions"
                                variant="outlined"
                                type="number"
                                value={subject.sessions}
                                onChange={handleSessionsChange(index)}
                                required
                            />
                        </Grid>

                        <Grid item xs={6}>
                            {index === 0 ? (
                                <Button onClick={handleAddSubject}>
                                    Add Subject
                                </Button>
                            ) : (
                                <Button color="error" onClick={handleRemoveSubject(index)}>
                                    Remove
                                </Button>
                            )}
                        </Grid>

                    </React.Fragment>
                ))}

                <Grid item xs={12}>
                    <Button type="submit" disabled={loader}>
                        {loader ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </Grid>

                <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            </Grid>
        </form>
    );
};

export default SubjectForm;