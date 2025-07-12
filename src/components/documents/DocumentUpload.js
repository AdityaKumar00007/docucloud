import React, { useState, useRef, useCallback } from 'react';
import { 
  Button, 
  TextField, 
  Paper, 
  Typography, 
  LinearProgress, 
  IconButton,
  Box,
  Chip,
  Fade,
  Card,
  CardContent
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import CloseIcon from '@material-ui/icons/Close';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import { uploadFile } from '../../firebase/storage';
import { auth } from '../../firebase/config';
import { 
  formatFileSize, 
  validateFile, 
  getFileTypeFromMime,
  getFirebaseErrorMessage
} from '../../utils';
import { MAX_FILE_SIZE, TOAST_MESSAGES } from '../../constants';
import toast from 'react-hot-toast';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
  },
  fileInput: {
    display: 'none',
  },
  uploadButton: {
    marginTop: theme.spacing(2),
  },
  fileInfo: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  fileCard: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileDetails: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  fileName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '300px',
    fontWeight: 500,
  },
  fileMetadata: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  progress: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  dropZone: {
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(6),
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: theme.palette.background.default,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.dark,
    },
  },
  dropZoneActive: {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.dark,
    transform: 'scale(1.02)',
  },
  dropZoneError: {
    borderColor: theme.palette.error.main,
    backgroundColor: theme.palette.error.light + '10',
  },
  uploadIcon: {
    fontSize: '3rem',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  successIcon: {
    color: theme.palette.success.main,
  },
  errorIcon: {
    color: theme.palette.error.main,
  },
  statusChip: {
    marginLeft: theme.spacing(1),
  },
}));

const DocumentUpload = ({ onUploadComplete }) => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Check if user is authenticated
  const isAuthenticated = auth.currentUser !== null;

  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    
    const errors = validateFile(file, MAX_FILE_SIZE);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setSelectedFile(file);
      toast.success('File selected successfully!');
    } else {
      setSelectedFile(null);
      toast.error(errors.join(', '));
    }
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('File removed');
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!isAuthenticated) {
      toast.error('You must be logged in to upload files');
      return;
    }

    setUploading(true);
    setValidationErrors([]);
    setUploadProgress(0);

    try {
      const result = await uploadFile(selectedFile, (progressData) => {
        const progress = Math.round(progressData.progress);
        setUploadProgress(progress);
      });

      toast.success(TOAST_MESSAGES.UPLOAD_SUCCESS);

      const documentData = {
        id: result.id,
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        url: result.url,
        description: description,
      };

      // Reset form
      setSelectedFile(null);
      setDescription('');

      // Notify parent component of successful upload
      if (onUploadComplete) {
        onUploadComplete(documentData);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper className={classes.root} elevation={2}>
      <Typography variant="h6" gutterBottom>
        Upload New Document
      </Typography>
      
      <div 
        className={`${classes.dropZone} ${
          dragActive ? classes.dropZoneActive : ''
        } ${
          validationErrors.length > 0 ? classes.dropZoneError : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className={classes.fileInput}
          onChange={handleInputChange}
          title="File upload"
          aria-label="Upload document file"
        />
        <CloudUploadIcon className={classes.uploadIcon} />
        <Typography variant="h6" color="textPrimary" gutterBottom>
          Choose a file or drag it here
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, Images
        </Typography>
      </div>

      {selectedFile && (
        <Fade in={true}>
          <Card className={classes.fileInfo}>
            <CardContent>
              <Box className={classes.fileCard}>
                <Box className={classes.fileDetails}>
                  <AttachFileIcon color="primary" style={{ marginRight: 12 }} />
                  <Box>
                    <Typography className={classes.fileName} variant="body1">
                      {selectedFile.name}
                    </Typography>
                    <Box className={classes.fileMetadata}>
                      <Chip
                        label={getFileTypeFromMime(selectedFile.type)}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                      <Typography variant="caption" color="textSecondary">
                        {formatFileSize(selectedFile.size)}
                      </Typography>
                      {validationErrors.length === 0 && (
                        <CheckCircleIcon className={classes.successIcon} fontSize="small" />
                      )}
                      {validationErrors.length > 0 && (
                        <ErrorIcon className={classes.errorIcon} fontSize="small" />
                      )}
                    </Box>
                  </Box>
                </Box>
                <IconButton size="small" onClick={handleRemoveFile}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      )}

      <TextField
        label="Document Description (optional)"
        variant="outlined"
        fullWidth
        margin="normal"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={uploading}
        multiline
        rows={2}
        placeholder="Add a description to help organize your documents..."
      />

      {uploading && (
        <Fade in={true}>
          <Box className={classes.progress}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="textSecondary">
                Uploading {selectedFile?.name}...
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {uploadProgress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              style={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </Fade>
      )}

      {validationErrors.length > 0 && (
        <Box mt={2}>
          {validationErrors.map((error, index) => (
            <Typography key={index} variant="body2" color="error" gutterBottom>
              • {error}
            </Typography>
          ))}
        </Box>
      )}

      <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={uploading ? null : <CloudUploadIcon />}
          onClick={handleUpload}
          disabled={!selectedFile || uploading || !isAuthenticated || validationErrors.length > 0}
        >
          {uploading ? (
            <Box display="flex" alignItems="center">
              <Typography variant="button">Uploading...</Typography>
            </Box>
          ) : (
            'Upload Document'
          )}
        </Button>
        
        {selectedFile && !uploading && (
          <Button
            variant="outlined"
            onClick={handleRemoveFile}
            startIcon={<CloseIcon />}
          >
            Clear
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default DocumentUpload;