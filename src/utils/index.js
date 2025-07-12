import { format, formatDistanceToNow } from 'date-fns';

// Format file size in bytes to human readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format date to human readable format
export const formatDate = (date) => {
  if (!date) return 'Unknown';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, 'MMM dd, yyyy');
};

// Format date to relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return 'Unknown';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Get file type from MIME type
export const getFileTypeFromMime = (mimeType) => {
  const typeMap = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'application/vnd.ms-powerpoint': 'PPT',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
    'text/plain': 'TXT',
    'text/csv': 'CSV',
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'image/gif': 'GIF',
    'image/svg+xml': 'SVG',
    'application/zip': 'ZIP',
    'application/x-rar-compressed': 'RAR',
  };
  
  return typeMap[mimeType] || mimeType.split('/')[1]?.toUpperCase() || 'FILE';
};

// Check if file type is supported
export const isSupportedFileType = (mimeType) => {
  const supportedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'application/zip',
    'application/x-rar-compressed',
  ];
  
  return supportedTypes.includes(mimeType) || mimeType.startsWith('image/');
};

// Validate file before upload
export const validateFile = (file, maxSize = 50 * 1024 * 1024) => { // 50MB default
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return errors;
  }
  
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${formatFileSize(maxSize)}`);
  }
  
  if (!isSupportedFileType(file.type)) {
    errors.push('File type not supported');
  }
  
  return errors;
};

// Sanitize filename
export const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-zA-Z0-9.-_]/g, '_');
};

// Generate unique filename
export const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExtension = originalName.replace(`.${extension}`, '');
  
  return `${sanitizeFileName(nameWithoutExtension)}_${timestamp}_${randomString}.${extension}`;
};

// Get file icon name based on type
export const getFileIconType = (mimeType) => {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'xls';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'ppt';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('text')) return 'txt';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive';
  return 'file';
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Convert Firebase error to user-friendly message
export const getFirebaseErrorMessage = (error) => {
  const errorMessages = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'storage/unauthorized': 'Permission denied. Please check your account permissions.',
    'storage/canceled': 'Upload was cancelled.',
    'storage/unknown': 'An unknown error occurred. Please try again.',
    'storage/retry-limit-exceeded': 'Upload failed after multiple attempts. Please try again.',
    'storage/invalid-checksum': 'File was corrupted during upload. Please try again.',
    'storage/quota-exceeded': 'Storage quota exceeded. Please free up space.',
  };
  
  return errorMessages[error.code] || error.message || 'An unexpected error occurred.';
};

// Check if user is online
export const isOnline = () => {
  return navigator.onLine;
};

// Copy text to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

// Download file from URL
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
