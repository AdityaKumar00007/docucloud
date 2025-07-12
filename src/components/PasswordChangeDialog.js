import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  InputAdornment,
  IconButton,
} from '@material-ui/core';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebase/config';
import toast from 'react-hot-toast';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    minWidth: 400,
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  passwordStrength: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    textAlign: 'center',
  },
  weak: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  medium: {
    backgroundColor: '#fff3e0',
    color: '#ef6c00',
  },
  strong: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  },
}));

const PasswordChangeDialog = ({ open, onClose }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getPasswordStrength = (password) => {
    if (password.length < 6) return { strength: 'weak', text: 'Too short' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 3) return { strength: 'weak', text: 'Weak password' };
    if (score < 4) return { strength: 'medium', text: 'Medium password' };
    return { strength: 'strong', text: 'Strong password' };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Reauthenticate user first
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        formData.currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, formData.newPassword);
      
      toast.success('Password updated successfully!');
      handleClose();
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        setErrors({ currentPassword: 'Incorrect current password' });
      } else {
        toast.error('Failed to update password: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onClose();
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Typography variant="body2" color="textSecondary" paragraph>
          Please enter your current password and choose a new secure password.
        </Typography>

        <TextField
          fullWidth
          label="Current Password"
          type={showPasswords.current ? 'text' : 'password'}
          value={formData.currentPassword}
          onChange={handleInputChange('currentPassword')}
          error={!!errors.currentPassword}
          helperText={errors.currentPassword}
          className={classes.textField}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => togglePasswordVisibility('current')}
                  edge="end"
                >
                  {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="New Password"
          type={showPasswords.new ? 'text' : 'password'}
          value={formData.newPassword}
          onChange={handleInputChange('newPassword')}
          error={!!errors.newPassword}
          helperText={errors.newPassword}
          className={classes.textField}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => togglePasswordVisibility('new')}
                  edge="end"
                >
                  {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {formData.newPassword && (
          <Box className={`${classes.passwordStrength} ${classes[passwordStrength.strength]}`}>
            <Typography variant="body2">
              {passwordStrength.text}
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          label="Confirm New Password"
          type={showPasswords.confirm ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          className={classes.textField}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => togglePasswordVisibility('confirm')}
                  edge="end"
                >
                  {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordChangeDialog;
