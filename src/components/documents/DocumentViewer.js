import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  IconButton, 
  Typography,
  Box,
  Divider,
  CircularProgress,
  Tooltip
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import GetAppIcon from '@material-ui/icons/GetApp';
import DeleteIcon from '@material-ui/icons/Delete';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ShareIcon from '@material-ui/icons/Share';
import { deleteFile } from '../../firebase/storage';
import { deleteDocument } from '../../firebase/firestore';

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 3),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  content: {
    padding: theme.spacing(2),
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  headerActions: {
    '& > *': {
      marginLeft: theme.spacing(1),
    },
  },
  metadata: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
  },
  metaRow: {
    display: 'flex',
    marginBottom: theme.spacing(1),
    '&:last-child': {
      marginBottom: 0,
    },
  },
  metaLabel: {
    fontWeight: 500,
    minWidth: 100,
  },
  metaValue: {
    color: theme.palette.text.secondary,
    overflowWrap: 'break-word',
  },
  viewerContainer: {
    width: '100%',
    height: 500,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.palette.background.default,
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  previewNotAvailable: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: theme.spacing(3),
    textAlign: 'center',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
  },
}));

const DocumentViewer = ({ document, open, onClose, onDelete }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handleDownload = () => {
    window.open(document.url, '_blank');
  };

  const handleDeleteClick = async () => {
    if (window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      try {
        setLoading(true);
        // Delete from storage
        await deleteFile(document.url);
        // Delete from Firestore
        await deleteDocument(document.id);
        
        if (onDelete) {
          onDelete(document.id);
        }
        onClose();
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreviewError = () => {
    setPreviewError(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return timestamp.toDate ? timestamp.toDate().toLocaleString() : new Date(timestamp).toLocaleString();
  };

  const getPreviewContent = () => {
    if (!document) return null;
    
    if (previewError) {
      return (
        <div className={classes.previewNotAvailable}>
          <VisibilityIcon style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
          <Typography variant="body1" gutterBottom>
            Preview not available
          </Typography>
          <Typography variant="body2" color="textSecondary">
            You can download the file to view its contents
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<GetAppIcon />}
            onClick={handleDownload}
            style={{ marginTop: 16 }}
          >
            Download
          </Button>
        </div>
      );
    }

    // Handle different file types
    const fileType = document.type;
    
    // Images
    if (fileType.includes('image/')) {
      return (
        <img 
          src={document.url} 
          alt={document.name} 
          className={classes.previewImage}
          onError={handlePreviewError}
        />
      );
    }
    
    // PDFs
    if (fileType === 'application/pdf') {
      return (
        <iframe 
          src={`${document.url}#toolbar=0`}
          title={document.name}
          className={classes.iframe}
          onError={handlePreviewError}
        />
      );
    }
    
    // Text files
    if (fileType.includes('text/') || fileType.includes('application/json')) {
      return (
        <iframe 
          src={document.url}
          title={document.name}
          className={classes.iframe}
          onError={handlePreviewError}
        />
      );
    }
    
    // For Office documents, try to use Google Docs Viewer
    if (
      fileType.includes('word') ||
      fileType.includes('excel') ||
      fileType.includes('powerpoint') ||
      fileType.includes('openxmlformats') ||
      fileType.includes('ms-excel') ||
      fileType.includes('ms-word') ||
      fileType.includes('ms-powerpoint')
    ) {
      const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(document.url)}&embedded=true`;
      return (
        <iframe 
          src={googleDocsUrl}
          title={document.name}
          className={classes.iframe}
          onError={handlePreviewError}
        />
      );
    }
    
    // Default: No preview
    return (
      <div className={classes.previewNotAvailable}>
        <VisibilityIcon style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
        <Typography variant="body1" gutterBottom>
          Preview not available for this file type
        </Typography>
        <Typography variant="body2" color="textSecondary">
          You can download the file to view its contents
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<GetAppIcon />}
          onClick={handleDownload}
          style={{ marginTop: 16 }}
        >
          Download
        </Button>
      </div>
    );
  };

  if (!document) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="document-viewer-title"
    >
      <DialogTitle id="document-viewer-title" className={classes.dialogTitle} disableTypography>
        <Typography variant="h6">{document.name}</Typography>
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent className={classes.content} dividers>
        <div className={classes.header}>
          <Typography variant="subtitle1">Document Details</Typography>
          <div className={classes.headerActions}>
            <Tooltip title="Download">
              <IconButton size="small" onClick={handleDownload}>
                <GetAppIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={handleDeleteClick}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton size="small">
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        
        <Box className={classes.metadata}>
          <div className={classes.metaRow}>
            <Typography variant="body2" className={classes.metaLabel}>
              File Type:
            </Typography>
            <Typography variant="body2" className={classes.metaValue}>
              {document.type}
            </Typography>
          </div>
          <div className={classes.metaRow}>
            <Typography variant="body2" className={classes.metaLabel}>
              Size:
            </Typography>
            <Typography variant="body2" className={classes.metaValue}>
              {formatFileSize(document.size)}
            </Typography>
          </div>
          <div className={classes.metaRow}>
            <Typography variant="body2" className={classes.metaLabel}>
              Created:
            </Typography>
            <Typography variant="body2" className={classes.metaValue}>
              {formatDate(document.createdAt)}
            </Typography>
          </div>
          {document.updatedAt && (
            <div className={classes.metaRow}>
              <Typography variant="body2" className={classes.metaLabel}>
                Last Modified:
              </Typography>
              <Typography variant="body2" className={classes.metaValue}>
                {formatDate(document.updatedAt)}
              </Typography>
            </div>
          )}
          {document.description && (
            <div className={classes.metaRow}>
              <Typography variant="body2" className={classes.metaLabel}>
                Description:
              </Typography>
              <Typography variant="body2" className={classes.metaValue}>
                {document.description}
              </Typography>
            </div>
          )}
        </Box>
        
        <Divider />
        
        <Typography variant="subtitle1" style={{ margin: '16px 0' }}>
          Preview
        </Typography>
        
        <div className={classes.viewerContainer}>
          {getPreviewContent()}
          {loading && (
            <div className={classes.loading}>
              <CircularProgress />
            </div>
          )}
        </div>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button 
          onClick={handleDownload} 
          color="primary" 
          variant="contained" 
          startIcon={<GetAppIcon />}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentViewer;