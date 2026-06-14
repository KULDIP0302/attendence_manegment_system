import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const DeleteConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    loading = false,
    title = 'Confirm Delete',
    description = 'Are you sure you want to delete?',
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{description}</DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmDialog;

