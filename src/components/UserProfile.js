import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Avatar,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Paper,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  VpnKey as VpnKeyIcon,
  CloudDownload as CloudDownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
} from '@material-ui/icons';
import { auth } from '../firebase/config';
import { updateProfile } from '../firebase/auth';
import { formatFileSize, formatDate } from '../utils';
import { THEME_CONFIG } from '../constants';
import { getUserStorageStats, exportUserData } from '../services/storageService';
import { useTheme } from '../contexts/ThemeContext';
import PasswordChangeDialog from './PasswordChangeDialog';
import toast from 'react-hot-toast';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: 0,
    minHeight: 500,
  },
  profileHeader: {
    padding: theme.spacing(3),
    background: `linear-gradient(135deg, ${THEME_CONFIG.PRIMARY_COLOR} 0%, ${THEME_CONFIG.SECONDARY_COLOR} 100%)`,
    color: 'white',
    textAlign: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    margin: '0 auto',
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.main,
    fontSize: '2rem',
  },
  tabContent: {
    padding: theme.spacing(3),
    minHeight: 400,
  },
  settingsCard: {
    marginBottom: theme.spacing(2),
  },
  storageBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.palette.grey[300],
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageProgress: {
    height: '100%',
    backgroundColor: theme.palette.primary.main,
    transition: 'width 0.3s ease',
  },
  dangerZone: {
    border: `1px solid ${theme.palette.error.main}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  editField: {
    marginBottom: theme.spacing(2),
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const UserProfile = ({ open, onClose }) => {
  const classes = useStyles();
  const { darkMode, toggleDarkMode } = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    autoSave: true,
    publicProfile: false,
    twoFactorAuth: false,
  });
  const [storageStats, setStorageStats] = useState({
    used: 0,
    total: 5 * 1024 * 1024 * 1024, // 5GB limit
    files: 0,
    breakdown: {},
  });
  const [loadingStorage, setLoadingStorage] = useState(false);

  useEffect(() => {
    if (open && auth.currentUser) {
      setUser(auth.currentUser);
      setEditData({
        displayName: auth.currentUser.displayName || '',
        email: auth.currentUser.email || '',
      });
      
      // Load user settings from localStorage
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(prevSettings => ({ ...prevSettings, ...JSON.parse(savedSettings) }));
      }
      
      // Load real storage stats
      loadStorageStats();
    }
  }, [open]);

  const loadStorageStats = async () => {
    setLoadingStorage(true);
    try {
      const stats = await getUserStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
      toast.error('Failed to load storage statistics');
    } finally {
      setLoadingStorage(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (setting) => (event) => {
    const checked = event.target.checked;
    
    // Handle dark mode separately
    if (setting === 'darkMode') {
      toggleDarkMode();
      toast.success(`Dark mode ${checked ? 'enabled' : 'disabled'}!`);
      return;
    }
    
    const newSettings = {
      ...settings,
      [setting]: checked,
    };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    toast.success('Settings updated!');
  };

  const handleEditToggle = () => {
    if (editing) {
      // Cancel editing
      setEditData({
        displayName: user.displayName || '',
        email: user.email || '',
      });
    }
    setEditing(!editing);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await updateProfile(user, {
        displayName: editData.displayName,
      });
      toast.success('Profile updated successfully!');
      setEditing(false);
      // Refresh user data
      setUser({ ...user, displayName: editData.displayName });
    } catch (error) {
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setEditData({
      ...editData,
      [field]: event.target.value,
    });
  };

  const getUserInitials = (displayName, email) => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const getStoragePercentage = () => {
    return (storageStats.used / storageStats.total) * 100;
  };

  const handleAccountDeletion = () => {
    // This would typically show a confirmation dialog
    toast.error('Account deletion functionality would be implemented here.');
  };

  const handleDataExport = async () => {
    try {
      setLoading(true);
      await exportUserData();
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = () => {
    setPasswordDialogOpen(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle style={{ padding: 0 }}>
        <Box className={classes.profileHeader}>
          <Avatar className={classes.avatar}>
            {user && getUserInitials(user.displayName, user.email)}
          </Avatar>
          <Typography variant="h5" gutterBottom>
            {editing ? (
              <TextField
                value={editData.displayName}
                onChange={handleInputChange('displayName')}
                placeholder="Enter your name"
                variant="outlined"
                size="small"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 4 }}
              />
            ) : (
              user?.displayName || 'User Profile'
            )}
          </Typography>
          <Typography variant="body1" style={{ opacity: 0.9 }}>
            {user?.email}
          </Typography>
          <Box mt={1}>
            <Chip
              label={user?.emailVerified ? 'Verified' : 'Unverified'}
              color={user?.emailVerified ? 'primary' : 'default'}
              size="small"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Profile" />
          <Tab label="Settings" />
          <Tab label="Storage" />
          <Tab label="Security" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box className={classes.tabContent}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card className={classes.settingsCard}>
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Display Name"
                          secondary={editing ? (
                            <TextField
                              value={editData.displayName}
                              onChange={handleInputChange('displayName')}
                              placeholder="Enter your name"
                              size="small"
                              className={classes.editField}
                            />
                          ) : (
                            user?.displayName || 'Not set'
                          )}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={editing ? handleSaveProfile : handleEditToggle}
                            disabled={loading}
                          >
                            {editing ? <SaveIcon /> : <EditIcon />}
                          </IconButton>
                          {editing && (
                            <IconButton edge="end" onClick={handleEditToggle}>
                              <CancelIcon />
                            </IconButton>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email"
                          secondary={user?.email}
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <CalendarIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Member Since"
                          secondary={user?.metadata?.creationTime ? 
                            formatDate(new Date(user.metadata.creationTime)) : 
                            'Recently'
                          }
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card className={classes.settingsCard}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Account Statistics
                    </Typography>
                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">
                        Total Documents: {storageStats.files}
                      </Typography>
                    </Box>
                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">
                        Last Login: {user?.metadata?.lastSignInTime ? 
                          formatDate(new Date(user.metadata.lastSignInTime)) : 
                          'Now'
                        }
                      </Typography>
                    </Box>
                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">
                        Account Status: {user?.emailVerified ? 'Verified' : 'Pending Verification'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box className={classes.tabContent}>
            <Typography variant="h6" gutterBottom>
              Application Settings
            </Typography>
            
            <Card className={classes.settingsCard}>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Push Notifications"
                      secondary="Receive notifications about document updates"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications}
                        onChange={handleSettingChange('notifications')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Updates"
                      secondary="Receive email notifications about important changes"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.emailUpdates}
                        onChange={handleSettingChange('emailUpdates')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <PaletteIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Dark Mode"
                      secondary="Use dark theme for the application"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={darkMode}
                        onChange={handleSettingChange('darkMode')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <SaveIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Auto Save"
                      secondary="Automatically save document changes"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.autoSave}
                        onChange={handleSettingChange('autoSave')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <LanguageIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Language"
                      secondary="English (Default)"
                    />
                    <ListItemSecondaryAction>
                      <Button size="small" variant="outlined">
                        Change
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box className={classes.tabContent}>
            <Typography variant="h6" gutterBottom>
              Storage Usage
            </Typography>
            
            <Card className={classes.settingsCard}>
              <CardContent>
                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body1">
                      {formatFileSize(storageStats.used)} of {formatFileSize(storageStats.total)} used
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {getStoragePercentage().toFixed(1)}%
                    </Typography>
                  </Box>
                  <Box className={classes.storageBar}>
                    <Box 
                      className={classes.storageProgress}
                      style={{ width: `${getStoragePercentage()}%` }}
                    />
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {loadingStorage ? '...' : storageStats.files}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Files
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {loadingStorage ? '...' : formatFileSize(storageStats.total - storageStats.used)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Available
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                {!loadingStorage && storageStats.breakdown && Object.keys(storageStats.breakdown).length > 0 && (
                  <Box mt={3}>
                    <Typography variant="h6" gutterBottom>
                      File Types
                    </Typography>
                    {Object.entries(storageStats.breakdown).map(([type, count]) => (
                      <Box key={type} display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">{type}</Typography>
                        <Typography variant="body2" color="textSecondary">{count} files</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
                
                <Box mt={3}>
                  <Button
                    variant="outlined"
                    startIcon={<CloudDownloadIcon />}
                    onClick={handleDataExport}
                    fullWidth
                  >
                    Export All Data
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box className={classes.tabContent}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            
            <Card className={classes.settingsCard}>
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <VpnKeyIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Two-Factor Authentication"
                      secondary="Add an extra layer of security to your account"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.twoFactorAuth}
                        onChange={handleSettingChange('twoFactorAuth')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Change Password"
                      secondary="Update your account password"
                    />
                    <ListItemSecondaryAction>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={handlePasswordChange}
                      >
                        Change
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <VisibilityIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Public Profile"
                      secondary="Make your profile visible to other users"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.publicProfile}
                        onChange={handleSettingChange('publicProfile')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
            
            <Paper className={classes.dangerZone}>
              <Typography variant="h6" color="error" gutterBottom>
                Danger Zone
              </Typography>
              <Typography variant="body2" paragraph>
                These actions are irreversible. Please proceed with caution.
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<DeleteIcon />}
                onClick={handleAccountDeletion}
              >
                Delete Account
              </Button>
            </Paper>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
      
      <PasswordChangeDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />
    </Dialog>
  );
};

export default UserProfile;
