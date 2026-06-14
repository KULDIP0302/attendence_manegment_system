import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventNoteIcon from '@mui/icons-material/EventNote';

const StudentSideBar = () => {
    const location = useLocation();
    const itemTextProps = { primaryTypographyProps: { sx: { fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.35 } } };
    const isHome = location.pathname === '/' || location.pathname.startsWith('/Student/dashboard');
    const itemSx = (active) => ({
        py: 1.2,
        mb: 0.5,
        borderRadius: '10px',
        mx: 1,
        color: active ? '#ffffff' : 'rgba(238, 245, 255, 0.9)',
        backgroundColor: active ? 'rgba(126, 164, 243, 0.35)' : 'transparent',
        '& .MuiListItemIcon-root': {
            minWidth: 40,
            color: active ? '#ffffff' : 'rgba(238, 245, 255, 0.9)',
        },
        '&:hover': {
            backgroundColor: 'rgba(126, 164, 243, 0.24)',
        },
    });
    return (
        <>
            <React.Fragment>
                <ListItemButton component={Link} to="/" sx={itemSx(isHome)}>
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Home" {...itemTextProps} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Student/subjects" sx={itemSx(location.pathname.startsWith('/Student/subjects'))}>
                    <ListItemIcon>
                        <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText primary="Subjects" {...itemTextProps} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Student/attendance" sx={itemSx(location.pathname.startsWith('/Student/attendance'))}>
                    <ListItemIcon>
                        <ClassOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary="Attendance" {...itemTextProps} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Student/leave-request" sx={itemSx(location.pathname.startsWith('/Student/leave-request'))}>
                    <ListItemIcon>
                        <EventNoteIcon />
                    </ListItemIcon>
                    <ListItemText primary="Leave Request" {...itemTextProps} />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset sx={{ fontSize: '1rem', fontWeight: 800, color: 'rgba(238, 245, 255, 0.8)', background: 'transparent' }}>
                    User
                </ListSubheader>
                <ListItemButton component={Link} to="/Student/profile" sx={itemSx(location.pathname.startsWith('/Student/profile'))}>
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary="Profile" {...itemTextProps} />
                </ListItemButton>
                <ListItemButton component={Link} to="/logout" sx={itemSx(location.pathname.startsWith('/logout'))}>
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" {...itemTextProps} />
                </ListItemButton>
            </React.Fragment>
        </>
    )
}

export default StudentSideBar