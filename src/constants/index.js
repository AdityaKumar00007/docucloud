// Application constants
export const APP_NAME = 'Cloud Document Manager';
export const APP_VERSION = '0.2.0';

// File upload constants
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = [
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

// UI constants
export const DRAWER_WIDTH = 240;
export const APPBAR_HEIGHT = 64;

// Pagination constants
export const DOCUMENTS_PER_PAGE = 20;
export const SEARCH_DEBOUNCE_DELAY = 300;

// Toast messages
export const TOAST_MESSAGES = {
  UPLOAD_SUCCESS: 'Document uploaded successfully!',
  UPLOAD_ERROR: 'Failed to upload document. Please try again.',
  DELETE_SUCCESS: 'Document deleted successfully!',
  DELETE_ERROR: 'Failed to delete document. Please try again.',
  COPY_SUCCESS: 'Link copied to clipboard!',
  COPY_ERROR: 'Failed to copy link.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Theme configuration
export const THEME_CONFIG = {
  PRIMARY_COLOR: '#3f51b5',
  SECONDARY_COLOR: '#f50057',
  SUCCESS_COLOR: '#4caf50',
  ERROR_COLOR: '#f44336',
  WARNING_COLOR: '#ff9800',
  INFO_COLOR: '#2196f3',
  BACKGROUND_COLOR: '#fafafa',
  PAPER_COLOR: '#ffffff',
  TEXT_PRIMARY: '#212121',
  TEXT_SECONDARY: '#757575',
};

// Storage paths
export const STORAGE_PATHS = {
  DOCUMENTS: 'documents',
  AVATARS: 'avatars',
  THUMBNAILS: 'thumbnails',
};

// Firestore collections
export const COLLECTIONS = {
  DOCUMENTS: 'documents',
  USERS: 'users',
  ANALYTICS: 'analytics',
};

// Document sorting options
export const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Date Added' },
  { value: 'size', label: 'Size' },
  { value: 'type', label: 'File Type' },
  { value: 'updatedAt', label: 'Last Modified' },
];

// View modes
export const VIEW_MODES = {
  LIST: 'list',
  GRID: 'grid',
  CARD: 'card',
};

// Document statuses
export const DOCUMENT_STATUS = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ARCHIVED: 'archived',
};

// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

// Cache keys
export const CACHE_KEYS = {
  DOCUMENTS: 'documents',
  USER_PREFERENCES: 'userPreferences',
  SEARCH_HISTORY: 'searchHistory',
};

// Local storage keys
export const LOCAL_STORAGE_KEYS = {
  THEME: 'theme',
  VIEW_MODE: 'viewMode',
  SORT_PREFERENCE: 'sortPreference',
  SEARCH_HISTORY: 'searchHistory',
};

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  DELETE_ERROR: 'DELETE_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
};

// API endpoints (if needed for future API integrations)
export const API_ENDPOINTS = {
  UPLOAD: '/api/upload',
  DOCUMENTS: '/api/documents',
  USERS: '/api/users',
  ANALYTICS: '/api/analytics',
};
