import React, { useState, useEffect } from 'react';
import { 
  CssBaseline, 
  CircularProgress,
  Container, 
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import DashboardIcon from '@material-ui/icons/Dashboard';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import FolderIcon from '@material-ui/icons/Folder';
import PersonIcon from '@material-ui/icons/Person';
import { makeStyles } from '@material-ui/core/styles';

import Auth from './components/Auth';
import DocumentUpload from './components/documents/DocumentUpload';
import DocumentList from './components/documents/DocumentList';
import DocumentViewer from './components/documents/DocumentViewer';
import UserProfile from './components/UserProfile';
import { onAuthStateChange, signOut } from './firebase/auth';
import { APP_NAME } from './constants';
import { CustomThemeProvider, useTheme } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.primary.main,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    color: 'white',
  },
  title: {
    flexGrow: 1,
    color: 'white',
    fontWeight: 600,
  },
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 240,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[8],
  },
  drawerContainer: {
    overflow: 'auto',
    paddingTop: theme.spacing(1),
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'center',
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    marginTop: 64, // AppBar height
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  mainContainer: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  menuListItem: {
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0, 1),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

// AppContent component that uses the theme
const AppContent = () => {
  const { theme } = useTheme();
  const classes = useStyles();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      // Auth state change will be caught by the observer
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleDrawer = () => {
    console.log('Toggle drawer clicked, current state:', drawerOpen);
    setDrawerOpen(!drawerOpen);
  };

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    setDocumentViewerOpen(true);
  };

  const handleDocumentViewerClose = () => {
    setDocumentViewerOpen(false);
    setSelectedDocument(null);
  };

  const handleDocumentUploadComplete = (documentData) => {
    setUploadSuccess(true);
    // Reset success message after 3 seconds
    setTimeout(() => {
      setUploadSuccess(false);
    }, 3000);
  };

  const handleProfileOpen = () => {
    setProfileOpen(true);
    setDrawerOpen(false);
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
  };

  // Display loading spinner while checking auth state
  if (loading) {
    return (
      <>
        <CssBaseline />
        <div className={classes.loadingContainer}>
          <CircularProgress />
        </div>
      </>
    );
  }

  // If not authenticated, show login/register page
  if (!user) {
    return (
      <>
        <CssBaseline />
        <Auth />
      </>
    );
  }

  // If authenticated, show main application
  return (
    <>
      <CssBaseline />
      <div className={classes.root}>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title} noWrap>
              {APP_NAME}
            </Typography>
            <Button color="inherit" onClick={handleProfileOpen} startIcon={<PersonIcon />}>
              Profile
            </Button>
            <Button color="inherit" onClick={handleLogout} startIcon={<ExitToAppIcon />}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Drawer
          className={classes.drawer}
          variant="temporary"
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.drawerHeader}>
            <Typography variant="h6" noWrap>
              Menu
            </Typography>
          </div>
          <Divider />
          <div className={classes.drawerContainer}>
            <List>
              <ListItem 
                button 
                className={classes.menuListItem}
                onClick={() => {
                  // Navigate to dashboard section
                  document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
                  toggleDrawer();
                }}
              >
                <ListItemIcon>
                  <DashboardIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Dashboard" 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
              <ListItem 
                button 
                className={classes.menuListItem}
                onClick={() => {
                  // Navigate to documents section
                  document.getElementById('documents')?.scrollIntoView({ behavior: 'smooth' });
                  toggleDrawer();
                }}
              >
                <ListItemIcon>
                  <FolderIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="My Documents" 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
              <ListItem 
                button 
                className={classes.menuListItem}
                onClick={() => {
                  // Navigate to upload section
                  document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
                  toggleDrawer();
                }}
              >
                <ListItemIcon>
                  <CloudUploadIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Upload" 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            </List>
            <Divider />
            <List>
              <ListItem 
                button 
                className={classes.menuListItem}
                onClick={handleProfileOpen}
              >
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Profile" 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            </List>
          </div>
        </Drawer>

        <main className={classes.content}>
          <Container maxWidth="lg" className={classes.mainContainer}>
            {/* Dashboard Section */}
            <Box id="dashboard" mb={4}>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome to {APP_NAME}
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Manage your documents securely in the cloud. Upload, organize, and access your files from anywhere.
              </Typography>
            </Box>

            {/* Upload Section */}
            <Box id="upload" mb={4}>
              <DocumentUpload onUploadComplete={handleDocumentUploadComplete} />
            </Box>

            {/* Documents Section */}
            <Box id="documents">
              <DocumentList 
                onDocumentSelected={handleDocumentSelect} 
                reloadTrigger={uploadSuccess ? Date.now() : 0} 
              />
            </Box>
          </Container>
        </main>

        <DocumentViewer
          document={selectedDocument}
          open={documentViewerOpen}
          onClose={handleDocumentViewerClose}
          onDelete={(docId) => {
            // Force document list refresh
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 100);
          }}
        />
        
        <UserProfile
          open={profileOpen}
          onClose={handleProfileClose}
        />
      </div>
      <Toaster position="bottom-right" reverseOrder={false} />
    </>
  );
};

// Main App component that wraps AppContent with the theme provider
const App = () => {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
};

export default App;
