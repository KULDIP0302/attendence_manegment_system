import React from 'react';
import { Avatar, Box, Container, Grid, Paper, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

const StudentProfile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const sclassName = currentUser?.sclassName;
  const studentSchool = currentUser?.school;

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <Avatar alt="Student Avatar" sx={{ width: 120, height: 120 }}>
                {String(currentUser?.name || 'S').charAt(0)}
              </Avatar>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <Typography variant="h5" component="h2" textAlign="center" sx={{ fontWeight: 800 }}>
                {currentUser?.name || '-'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <Typography variant="subtitle1" component="p" textAlign="center" sx={{ fontWeight: 700 }}>
                Student Roll No: {currentUser?.rollNum ?? '-'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <Typography variant="subtitle1" component="p" textAlign="center" sx={{ fontWeight: 700 }}>
                Class: {sclassName?.sclassName || '-'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <Typography variant="subtitle1" component="p" textAlign="center" sx={{ fontWeight: 700 }}>
                School: {studentSchool?.schoolName || '-'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default StudentProfile