import { useState } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useNavigate } from 'react-router-dom';

const textFieldSx = {
    '& .MuiInputLabel-root': {
        fontSize: '1.05rem',
        fontWeight: 600,
        color: 'rgba(31, 31, 56, 0.75)',
    },
    '& .MuiOutlinedInput-root': {
        borderRadius: '14px',
        fontSize: '1.125rem',
        backgroundColor: 'rgba(255,255,255,0.95)',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '& fieldset': {
            borderColor: 'rgba(31, 31, 56, 0.14)',
        },
        '&:hover fieldset': {
            borderColor: 'rgba(77, 181, 255, 0.45)',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'rgba(77, 181, 255, 0.75)',
            borderWidth: '2px',
        },
        '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(77, 181, 255, 0.2)',
        },
    },
    '& .MuiOutlinedInput-input': {
        py: 1.35,
    },
};

const AddSubject = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        subjectName: '',
        subjectCode: '',
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Keep the add-subject entry lightweight; existing flow handles class-linked creation.
        navigate('/Admin/subjects/chooseclass');
    };

    return (
        <Box
            sx={{
                minHeight: { xs: 'auto', sm: 'calc(100vh - 32px)' },
                py: { xs: 2.5, sm: 3.5 },
                px: { xs: 1.25, sm: 2 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                    'linear-gradient(145deg, rgba(31, 31, 56, 0.07) 0%, rgba(77, 181, 255, 0.09) 45%, rgba(44, 44, 108, 0.06) 100%)',
            }}
        >
            <Container maxWidth="sm" disableGutters sx={{ px: { xs: 0.5, sm: 0 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2.75, sm: 3.75 },
                        borderRadius: '22px',
                        border: '1px solid rgba(44, 44, 108, 0.1)',
                        boxShadow:
                            '0 18px 48px rgba(31, 31, 56, 0.14), 0 4px 14px rgba(0, 0, 0, 0.06)',
                        overflow: 'hidden',
                    }}
                >
                    <Stack spacing={0.5} sx={{ mb: 3 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background:
                                        'linear-gradient(135deg, rgba(77, 181, 255, 0.22) 0%, rgba(44, 44, 108, 0.18) 100%)',
                                    border: '1px solid rgba(77, 181, 255, 0.35)',
                                }}
                            >
                                <MenuBookIcon sx={{ fontSize: 30, color: '#2c2c6c' }} />
                            </Box>
                            <Box>
                                <Typography
                                    component="h1"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: { xs: '1.85rem', sm: '2.2rem' },
                                        letterSpacing: '-0.03em',
                                        lineHeight: 1.15,
                                        color: '#1f1f38',
                                    }}
                                >
                                    Add Subject
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>

                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={2.5}>
                            <TextField
                                name="subjectName"
                                label="Subject Name"
                                value={formData.subjectName}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={textFieldSx}
                            />
                            <TextField
                                name="subjectCode"
                                label="Subject Code"
                                value={formData.subjectCode}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={textFieldSx}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                sx={{
                                    mt: 0.5,
                                    alignSelf: { xs: 'stretch', sm: 'flex-start' },
                                    px: { xs: 3, sm: 4.5 },
                                    py: 1.35,
                                    fontSize: '1.125rem',
                                    fontWeight: 700,
                                    borderRadius: '14px',
                                    textTransform: 'none',
                                    letterSpacing: '0.02em',
                                    background: 'linear-gradient(135deg, #1f1f38 0%, #2c2c6c 100%)',
                                    boxShadow: '0 8px 24px rgba(31, 31, 56, 0.28)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #2a2a4a 0%, #353580 100%)',
                                        boxShadow: '0 10px 28px rgba(31, 31, 56, 0.35)',
                                    },
                                }}
                            >
                                Save
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default AddSubject;
