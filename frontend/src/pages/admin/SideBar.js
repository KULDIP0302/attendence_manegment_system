import * as React from 'react';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

const SideBar = () => {
    const location = useLocation();
    const isPath = (path) => location.pathname === path || location.pathname.startsWith(path);
    const itemTextProps = { primaryTypographyProps: { sx: { fontSize: '1.32rem', fontWeight: 800, lineHeight: 1.35 } } };
    const itemSx = (active) => ({
        py: 1.2,
        mb: 0.5,
        borderRadius: '10px',
        mx: 1,
        color: active ? '#ffffff' : 'rgba(231, 238, 255, 0.88)',
        backgroundColor: active ? 'rgba(79, 116, 204, 0.4)' : 'transparent',
        '& .MuiListItemIcon-root': {
            minWidth: 42,
            color: active ? '#ffffff' : 'rgba(231, 238, 255, 0.88)',
            '& .MuiSvgIcon-root': {
                    fontSize: '1.55rem',
            },
        },
        '&:hover': {
            backgroundColor: 'rgba(85, 123, 214, 0.28)',
        },
    });
    return (
        <>
            <React.Fragment>
                <ListItemButton component={Link} to="/Admin/dashboard" sx={itemSx(isPath('/Admin/dashboard') || location.pathname === '/')}>
                    <ListItemIcon>
                        <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Home" {...itemTextProps} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/classes" sx={itemSx(isPath('/Admin/classes'))}>
                    <ListItemIcon>
                        <ClassOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary="Class" {...itemTextProps} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/subjects" sx={itemSx(isPath('/Admin/subjects'))}>
                    <ListItemIcon>
                        <MenuBookIcon />
                    </ListItemIcon>
                    <ListItemText primary="Subject" {...itemTextProps} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/teachers" sx={itemSx(isPath('/Admin/teachers'))}>
                    <ListItemIcon>
                        <SupervisorAccountOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary="Teacher" {...itemTextProps} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/students" sx={itemSx(isPath('/Admin/students'))}>
                    <ListItemIcon>
                        <PersonOutlineIcon />
                    </ListItemIcon>
                    <ListItemText primary="Student" {...itemTextProps} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/profile" sx={itemSx(isPath('/Admin/profile'))}>
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary="Profile" {...itemTextProps} />
                </ListItemButton>
                <ListItemButton component={Link} to="/logout" sx={itemSx(isPath('/logout'))}>
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" {...itemTextProps} />
                </ListItemButton>
            </React.Fragment>
        </>
    )
}

export default SideBar
