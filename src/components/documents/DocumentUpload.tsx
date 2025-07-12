import React, { useState, useRef } from 'react';
import { 
  Button, 
  TextField, 
  Paper, 
  Typography, 
  LinearProgress, 
  Grid,
  IconButton,
  Box,
  Snackbar,
  CircularProgress
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import CloseIcon from '@material-ui/icons/Close';
import { uploadFile } from '../../firebase/storage';

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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
  },
  fileName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '250px',
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
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  dropZoneActive: {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface DocumentUploadProps {
  onUploadComplete: (documentData: any) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadComplete }) => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Upload the file with progress tracking
      const result = await uploadFile(selectedFile, (progressData) => {
        setUploadProgress(Math.round(progressData.progress));
      });

      // Update document metadata with description
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
      onUploadComplete(documentData);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
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
        className={`${classes.dropZone} ${dragActive ? classes.dropZoneActive : ''}`}
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
          onChange={handleFileSelect}
          title="File upload"
          aria-label="Upload document file"
        />
        <CloudUploadIcon fontSize="large" color="primary" />
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Drag and drop a file here, or click to select a file
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG
        </Typography>
      </div>

      {selectedFile && (
        <Box className={classes.fileInfo}>
          <Box display="flex" alignItems="center">
            <AttachFileIcon color="primary" />
            <Typography className={classes.fileName} variant="body2" style={{ marginLeft: 8 }}>
              {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleRemoveFile}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <TextField
        label="Document Description (optional)"
        variant="outlined"
        fullWidth
        margin="normal"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={uploading}
      />

      {uploading && (
        <div className={classes.progress}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Uploading... {uploadProgress}%
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </div>
      )}

      <Grid container spacing={2} className={classes.uploadButton}>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </Grid>
      </Grid>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default DocumentUpload;