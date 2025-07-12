import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  List, 
  CircularProgress, 
  Snackbar,
  Box,
  Button
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import { getDocuments } from '../../firebase/firestore';
import DocumentCard from './DocumentCard';
import { DocumentType } from '../../types/document.types';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  list: {
    marginTop: theme.spacing(2),
  },
  noDocuments: {
    padding: theme.spacing(3),
    textAlign: 'center',
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4),
  },
  refreshButton: {
    marginBottom: theme.spacing(2),
  }
}));

interface DocumentListProps {
  onDocumentSelected?: (document: DocumentType) => void;
  onDocumentDeleted?: () => void;
  reloadTrigger?: number;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  onDocumentSelected, 
  onDocumentDeleted,
  reloadTrigger = 0
}) => {
  const classes = useStyles();
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError('');
      
      try {
        const docs = await getDocuments();
        setDocuments(docs);
      } catch (err: any) {
        console.error('Error fetching documents:', err);
        setError(err.message || 'Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [refreshCount, reloadTrigger]);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  const handleDocumentDeleted = (deletedDocId: string) => {
    setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== deletedDocId));
    if (onDocumentDeleted) {
      onDocumentDeleted();
    }
  };

  return (
    <Paper className={classes.root} elevation={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" gutterBottom>
          Your Documents
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          color="primary"
          className={classes.refreshButton}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <div className={classes.loadingContainer}>
          <CircularProgress />
        </div>
      ) : documents.length === 0 ? (
        <div className={classes.noDocuments}>
          <Typography variant="body1" color="textSecondary">
            No documents found. Upload a document to get started.
          </Typography>
        </div>
      ) : (
        <List className={classes.list}>
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onSelect={onDocumentSelected}
              onDelete={handleDocumentDeleted}
            />
          ))}
        </List>
      )}

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default DocumentList;