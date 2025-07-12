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
  CircularProgress,
  Paper
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import GetAppIcon from '@material-ui/icons/GetApp';
import DeleteIcon from '@material-ui/icons/Delete';
import ShareIcon from '@material-ui/icons/Share';
import { DocumentType } from '../../types/document.types';
import { deleteDocument } from '../../firebase/firestore';

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
  },
  dialogContent: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    height: '70vh',
    overflow: 'hidden',
  },
  viewerContainer: {
    flexGrow: 1,
    overflow: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
  },
  documentFrame: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  textPreview: {
    width: '100%',
    height: '100%',
    padding: theme.spacing(2),
    overflow: 'auto',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
  },
  metadata: {
    padding: theme.spacing(1, 0),
    marginBottom: theme.spacing(1),
  },
  unsupportedFormat: {
    padding: theme.spacing(3),
    textAlign: 'center',
  },
  actionButton: {
    margin: theme.spacing(0, 0.5),
  },
}));

interface DocumentViewerProps {
  document: DocumentType | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (documentId: string) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  document, 
  open, 
  onClose,
  onDelete
}) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!document) return;
    
    try {
      setDeleting(true);
      await deleteDocument(document.id);
      setDeleteDialogOpen(false);
      if (onDelete) {
        onDelete(document.id);
      }
      onClose();
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDownload = () => {
    if (!document) return;
    const link = document.url;
    window.open(link, '_blank');
  };

  const handleShare = () => {
    if (!document) return;
    if (navigator.share) {
      navigator.share({
        title: document.name,
        url: document.url,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(document.url)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Could not copy link:', err));
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  const renderDocumentPreview = () => {
    if (!document) return null;

    const fileType = document.type;
    
    // Handle PDFs
    if (fileType.includes('pdf')) {
      return (
        <iframe 
          src={`${document.url}#toolbar=0&navpanes=0`} 
          className={classes.documentFrame}
          title={document.name}
          onLoad={handleIframeLoad}
        />
      );
    }
    
    // Handle images
    if (fileType.includes('image')) {
      return (
        <img 
          src={document.url} 
          alt={document.name}
          className={classes.imagePreview}
          onLoad={handleImageLoad}
        />
      );
    }
    
    // Handle text files
    if (fileType.includes('text') || fileType.includes('json') || fileType.includes('javascript') || fileType.includes('css')) {
      if (textContent === null) {
        fetch(document.url)
          .then(response => response.text())
          .then(text => {
            setTextContent(text);
            setLoading(false);
          })
          .catch(error => {
            console.error('Error fetching text content:', error);
            setLoading(false);
          });
        
        return null;
      }
      
      return (
        <Paper className={classes.textPreview} variant="outlined">
          {textContent}
        </Paper>
      );
    }
    
    // Handle other formats with a download prompt
    return (
      <Box className={classes.unsupportedFormat}>
        <Typography variant="body1" gutterBottom>
          Preview not available for this file type.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<GetAppIcon />}
          onClick={handleDownload}
        >
          Download File
        </Button>
      </Box>
    );
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        fullWidth
        maxWidth="md"
        aria-labelledby="document-viewer-dialog"
      >
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Typography variant="h6">
            {document?.name || 'Document Viewer'}
          </Typography>
          <IconButton aria-label="close" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent className={classes.dialogContent} dividers>
          {document && (
            <Box className={classes.metadata}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Type: {document.type} | Size: {(document.size / 1024).toFixed(1)} KB | 
                Uploaded: {document.createdAt && new Date(document.createdAt).toLocaleString()}
              </Typography>
              {document.description && (
                <Typography variant="body2" color="textPrimary">
                  <strong>Description:</strong> {document.description}
                </Typography>
              )}
            </Box>
          )}
          
          <Box className={classes.viewerContainer}>
            {renderDocumentPreview()}
            
            {loading && (
              <Box className={classes.loadingContainer}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleShare}
            color="primary"
            startIcon={<ShareIcon />}
            className={classes.actionButton}
          >
            Share
          </Button>
          <Button 
            onClick={handleDownload}
            color="primary"
            startIcon={<GetAppIcon />}
            className={classes.actionButton}
          >
            Download
          </Button>
          <Button 
            onClick={handleDeleteClick}
            color="secondary"
            startIcon={<DeleteIcon />}
            className={classes.actionButton}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Document</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{document?.name}"? This action cannot be undone.
          </Typography>
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

export default DocumentViewer;