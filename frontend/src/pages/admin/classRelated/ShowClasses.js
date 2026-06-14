import { useEffect } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import DeleteConfirmDialog from '../../../components/admin/DeleteConfirmDialog';
import Popup from '../../../components/Popup';

const ShowClasses = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { sclassesList, loading } = useSelector((state) => state.sclass);
  const { currentUser } = useSelector((state) => state.user);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [showPopup, setShowPopup] = React.useState(false);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getAllSclasses(currentUser._id, 'Sclass'));
    }
  }, [currentUser?._id, dispatch]);

  const sclassColumns = [
    { id: 'name', label: 'Class Name', minWidth: 170 },
  ];

  const sclassRows = Array.isArray(sclassesList)
    ? sclassesList.map((sclass) => ({
        name: sclass.sclassName,
        id: sclass._id,
      }))
    : [];

  const SclassButtonHaver = ({ row }) => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
        <IconButton
          onClick={() => {
            setDeleteId(row.id);
            setConfirmOpen(true);
          }}
          color="error"
          aria-label="delete class"
        >
          <DeleteOutlineIcon />
        </IconButton>
        <BlueButton variant="contained" onClick={() => navigate(`/Admin/classes/class/${row.id}`)}>
          View
        </BlueButton>
      </Box>
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteId || !currentUser?._id) return;

    setDeleteLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/Sclass/${deleteId}`);
      dispatch(getAllSclasses(currentUser._id, 'Sclass'));
      setConfirmOpen(false);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Error deleting class');
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
              onClick={() => navigate('/Admin/addclass')}
            >
              Add Class
            </GreenButton>
          </Box>

          <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3, boxShadow: 3 }}>
            {sclassRows.length > 0 ? (
              <TableTemplate
                buttonHaver={SclassButtonHaver}
                columns={sclassColumns}
                rows={sclassRows}
                headerFontSize="1.24rem"
                bodyFontSize="1.15rem"
              />
            ) : (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6">No classes found</Typography>
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
        title="Delete Class"
        description="Are you sure you want to delete?"
      />
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default ShowClasses;