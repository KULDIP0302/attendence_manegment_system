import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import PaidIcon from '@mui/icons-material/Paid';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

const TeacherSideBar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);
    const isHome = location.pathname === '/' || isActive('/Teacher/dashboard');
    const itemSx = (active) => ({
        py: 1.2,
        mb: 0.5,
        borderRadius: '10px',
        mx: 1,
        color: active ? '#ffffff' : 'rgba(233, 255, 250, 0.9)',
        backgroundColor: active ? 'rgba(38, 166, 154, 0.35)' : 'transparent',
        '& .MuiListItemIcon-root': {
            minWidth: 40,
            color: active ? '#ffffff' : 'rgba(233, 255, 250, 0.9)',
        },
        '&:hover': {
            backgroundColor: 'rgba(51, 181, 168, 0.26)',
        },
    });

    return (
        <>
            <React.Fragment>
                <ListItemButton component={Link} to="/Teacher/dashboard" sx={itemSx(isHome)}>
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Home" primaryTypographyProps={{ sx: { fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.35 } }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/class" sx={itemSx(isActive('/Teacher/class'))}>
                    <ListItemIcon>
                        <ClassOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Class"
                        primaryTypographyProps={{ sx: { fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.35 } }}
                    />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/monthly-report" sx={itemSx(isActive('/Teacher/monthly-report'))}>
                    <ListItemIcon>
                        <PaidIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Monthly Report"
                        primaryTypographyProps={{ sx: { fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.35 } }}
                    />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/leave-requests" sx={itemSx(isActive('/Teacher/leave-requests'))}>
                    <ListItemIcon>
                        <AssignmentTurnedInIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Leave Request"
                        primaryTypographyProps={{ sx: { fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.35 } }}
                    />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset sx={{ fontSize: '1rem', fontWeight: 800, color: 'rgba(233, 255, 250, 0.8)', background: 'transparent' }}>
                    User
                </ListSubheader>
                <ListItemButton component={Link} to="/Teacher/profile" sx={itemSx(isActive('/Teacher/profile'))}>
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Profile"
                        primaryTypographyProps={{ sx: { fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.35 } }}
                    />
                </ListItemButton>
                <ListItemButton component={Link} to="/logout" sx={itemSx(location.pathname.startsWith('/logout'))}>
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" primaryTypographyProps={{ sx: { fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.35 } }} />
                </ListItemButton>
            </React.Fragment>
        </>
    )
}

export default TeacherSideBar