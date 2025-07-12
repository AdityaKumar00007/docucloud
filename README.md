# Cloud Document Management System

A secure document storage and management system built with React, Firebase Auth, Firestore, and Firebase Storage.

## Features

- User authentication with Firebase Auth
- Document upload with progress tracking
- Document listing and management
- Document previewing for various file types
- Material-UI interface components

## Setup Instructions

1. Clone this repository
2. Install dependencies: `npm install`
3. Create a Firebase project at https://console.firebase.google.com/
4. Enable Authentication, Firestore, and Storage in your Firebase project
5. Update `.env` file with your Firebase configuration
6. Run the application: `npm start`

## Firebase Security Rules

For proper security, add these rules to your Firebase project:

### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own documents
    match /documents/{document} {
      allow read, update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
    }
    
    // Allow users to read/write their own user profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && userId == request.auth.uid;
    }
  }
}
```

### Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read/write their own documents
    match /documents/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && userId == request.auth.uid;
    }
    
    // Deny all other requests
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
