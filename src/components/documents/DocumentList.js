import React, { useState, useEffect } from 'react';
import { 
  List, 
  Typography, 
  Paper, 
  CircularProgress, 
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Box,
  Grid,
  Button
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import SortIcon from '@material-ui/icons/Sort';
import RefreshIcon from '@material-ui/icons/Refresh';
// import EmptyStateImage from '../../assets/empty-state.svg'; // Commented out to prevent import errors
import DocumentCard from './DocumentCard';
import { getDocuments } from '../../firebase/firestore';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  searchField: {
    marginBottom: theme.spacing(2),
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  sortSelect: {
    minWidth: 150,
  },
  listContainer: {
    marginTop: theme.spacing(2),
    minHeight: 400,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    textAlign: 'center',
  },
  emptyStateImage: {
    width: 200,
    marginBottom: theme.spacing(2),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(4),
  },
  refreshButton: {
    marginLeft: theme.spacing(1),
  }
}));

const DocumentList = ({ onDocumentSelected, reloadTrigger }) => {
  const classes = useStyles();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [indexRequired, setIndexRequired] = useState(false);
  const [indexUrl, setIndexUrl] = useState('');

  // Load documents from Firestore
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      setIndexRequired(false);
      console.log('Loading documents from Firestore...');
      const docs = await getDocuments();
      console.log(`Loaded ${docs.length} documents:`, docs);
      setDocuments(docs);
      setFilteredDocuments(docs);
    } catch (err) {
      console.error('Error loading documents:', err);
      // Check if this is an index error
      if (err.message && err.message.includes('requires an index')) {
        // Extract the URL from the error message
        const urlMatch = err.message.match(/(https:\/\/console\.firebase\.google\.com\S+)/);
        if (urlMatch && urlMatch[1]) {
          setIndexRequired(true);
          setIndexUrl(urlMatch[1]);
          setError('This query requires a Firestore index. Click "Create Index" to fix this issue.');
        } else {
          setError(`Failed to load documents: ${err.message}`);
        }
      } else {
        setError(`Failed to load documents: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [reloadTrigger]);

  // Filter and sort documents when search query or sort options change
  useEffect(() => {
    let results = [...documents];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(doc => 
        doc.name.toLowerCase().includes(query) ||
        (doc.description && doc.description.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting (default descending)
    results.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      // Handle special cases for dates
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        valueA = valueA ? (valueA.toDate ? valueA.toDate().getTime() : new Date(valueA).getTime()) : 0;
        valueB = valueB ? (valueB.toDate ? valueB.toDate().getTime() : new Date(valueB).getTime()) : 0;
      }
      
      // Default descending order (newest first)
      if (valueA < valueB) return 1;
      if (valueA > valueB) return -1;
      return 0;
    });
    
    setFilteredDocuments(results);
  }, [documents, searchQuery, sortBy]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };


  const handleDocumentDelete = (documentId) => {
    setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
  };

  const handleRefresh = () => {
    loadDocuments();
  };

  return (
    <Paper className={classes.root} elevation={2}>
      <div className={classes.header}>
        <Typography variant="h6">My Documents</Typography>
        <Box display="flex" alignItems="center">
          <Typography variant="body2" color="textSecondary">
            {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
          </Typography>
          <Button 
            className={classes.refreshButton}
            size="small"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </div>

      <TextField 
        className={classes.searchField}
        variant="outlined"
        fullWidth
        placeholder="Search documents..."
        value={searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={2} className={classes.filterContainer}>
        <Grid item xs={12} sm={6} md={4}>
          <Box display="flex" alignItems="center">
            <FormControl variant="outlined" size="small" className={classes.sortSelect}>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="createdAt">Date Added</MenuItem>
                <MenuItem value="size">Size</MenuItem>
                <MenuItem value="type">File Type</MenuItem>
              </Select>
            </FormControl>
            <Box ml={1}>
              <Typography variant="body2" color="textSecondary">
                Newest First
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <div className={classes.listContainer}>
        {loading ? (
          <div className={classes.loadingContainer}>
            <CircularProgress />
          </div>
        ) : error ? (
          <div className={classes.emptyState}>
            <Typography color="error" gutterBottom>{error}</Typography>
            {indexRequired ? (
              <>
                <Typography variant="body2" gutterBottom>
                  This is a one-time setup for your database queries.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  href={indexUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginBottom: 16 }}
                >
                  Create Index
                </Button>
                <Typography variant="body2" color="textSecondary">
                  After creating the index, wait a few minutes and then
                  <Button 
                    color="primary" 
                    onClick={handleRefresh}
                    size="small"
                    style={{ marginLeft: 8 }}
                  >
                    try again
                  </Button>
                </Typography>
              </>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleRefresh}
                startIcon={<RefreshIcon />}
              >
                Try Again
              </Button>
            )}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className={classes.emptyState}>
            <Box 
              sx={{
                width: 200,
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                marginBottom: 2
              }}
            >
              <Typography variant="h2" color="textSecondary">📁</Typography>
            </Box>
            {searchQuery ? (
              <Typography variant="body1">
                No documents match your search criteria
              </Typography>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  No documents yet
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Upload your first document to get started
                </Typography>
              </>
            )}
          </div>
        ) : (
          <List disablePadding>
            {filteredDocuments.map(document => (
              <DocumentCard
                key={document.id}
                document={document}
                onSelect={onDocumentSelected}
                onDelete={handleDocumentDelete}
              />
            ))}
          </List>
        )}
      </div>
    </Paper>
  );
};

export default DocumentList;