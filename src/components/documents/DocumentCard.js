import React, { useState } from 'react';
import { 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Chip,
  Box,
  CircularProgress
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import ImageIcon from '@material-ui/icons/Image';
import DescriptionIcon from '@material-ui/icons/Description';
import { deleteDocument } from '../../firebase/firestore';
import { formatFileSize, getFileTypeFromMime } from '../../utils';

const useStyles = makeStyles((theme) => ({
  listItem: {
    marginBottom: theme.spacing(1),
    border: '1px solid',
    borderColor: theme.palette.divider,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  fileIcon: {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  fileSize: {
    marginLeft: theme.spacing(1),
  },
  fileType: {
    marginLeft: theme.spacing(1),
  },
  listItemText: {
    maxWidth: '70%',
  },
  fileName: {
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
  },
  fileDescription: {
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  metadata: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(0.5),
  },
}));

const DocumentCard = ({ document, onSelect, onDelete }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleClickDocument = () => {
    if (onSelect) {
      onSelect(document);
    }
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await deleteDocument(document.id);
      setDeleteDialogOpen(false);
      if (onDelete) {
        onDelete(document.id);
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = () => {
    const fileType = document.type;
    
    if (fileType.includes('pdf')) {
      return <PictureAsPdfIcon className={classes.fileIcon} />;
    } else if (fileType.includes('image')) {
      return <ImageIcon className={classes.fileIcon} />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <DescriptionIcon className={classes.fileIcon} />;
    } else {
      return <InsertDriveFileIcon className={classes.fileIcon} />;
    }
  };

  const getFileTypeLabel = (mimeType) => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word')) return 'DOC';
    if (mimeType.includes('excel')) return 'XLS';
    if (mimeType.includes('presentation')) return 'PPT';
    if (mimeType.includes('image')) return mimeType.split('/')[1].toUpperCase();
    if (mimeType.includes('text')) return 'TXT';
    
    // Default: use the subtype part of the MIME type
    const parts = mimeType.split('/');
    return parts.length > 1 ? parts[1].toUpperCase() : parts[0].toUpperCase();
  };

  return (
    <>
      <ListItem button onClick={handleClickDocument} className={classes.listItem}>
        <Box display="flex" alignItems="center" width="100%">
          {getFileIcon()}
          <ListItemText
            className={classes.listItemText}
            primary={
              <Typography variant="body1" className={classes.fileName}>
                {document.name}
              </Typography>
            }
            secondary={
              <>
                {document.description && (
                  <Typography variant="body2" className={classes.fileDescription}>
                    {document.description}
                  </Typography>
                )}
                <Box className={classes.metadata}>
                  <Typography variant="caption" color="textSecondary">
                    {document.createdAt && new Date(document.createdAt).toLocaleDateString()}
                  </Typography>
                  <Chip
                    label={getFileTypeLabel(document.type)}
                    size="small"
                    variant="outlined"
                    className={classes.fileType}
                  />
                  <Typography variant="caption" color="textSecondary" className={classes.fileSize}>
                    {formatFileSize(document.size)}
                  </Typography>
                </Box>
              </>
            }
          />
        </Box>
        
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="more options" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); handleClickDocument(); }}>View</MenuItem>
        <MenuItem onClick={() => { window.open(document.url, '_blank'); handleMenuClose(); }}>Download</MenuItem>
        <MenuItem onClick={handleDeleteClick} style={{ color: 'red' }}>Delete</MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Document</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{document.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="primary" 
            variant="contained" 
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : null}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DocumentCard;