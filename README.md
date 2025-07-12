# Cloud Document Management System

![Cloud Document Manager](images/cover-image.png)

A cutting-edge, secure document storage and management system built leveraging React and Firebase. This platform offers user authentication, real-time document upload, management, and preview capabilities. It combines the sophistication of Material-UI with Firebase's robust backend to deliver an exceptional user experience.

## ✨ Features

- **🔐 User Authentication**: Secure login and registration with Firebase Auth
- **📤 Document Upload**: Drag-and-drop upload interface with progress tracking
- **📁 Document Management**: Easy listing, sorting, and searching capabilities
- **👀 Real-time Preview**: View documents directly in the app
- **📱 Responsive Design**: Optimized for all devices using Material-UI
- **🔍 Search & Filter**: Advanced search and filtering options
- **🎨 Modern UI**: Clean, intuitive interface with Material Design

## 🚀 Tech Stack

- **Frontend**: React 17, Material-UI
- **Backend**: Firebase (Auth, Firestore, Storage)
- **File Handling**: React Dropzone, MIME type validation
- **State Management**: React Context API
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## 📸 Screenshots

### Upload Interface
![Upload Interface](images/upload-interface.png)

### Document List
![Document List](images/document-list.png)

### Document Viewer
![Document Viewer](images/document-viewer.png)

## 🛠️ Installation

To get started with the Cloud Document Management System, follow these steps:

1. **Clone the repository**

   ```bash
   git clone https://github.com/AdityaKumar00007/cloud-doc-manager.git
   cd cloud-doc-manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase**

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, and Storage
   - Create a `.env` file in the root directory with your Firebase configuration:

   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the application**

   ```bash
   npm start
   ```

## 🔒 Firebase Security Rules

To ensure data security, implement these rules in your Firebase project:

### Firestore Rules
```javascript
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
```javascript
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
```

## 📂 Project Structure

```
cloud-doc-manager/
├── public/
├── src/
│   ├── components/
│   │   ├── documents/
│   │   │   ├── DocumentCard.js
│   │   │   ├── DocumentList.js
│   │   │   ├── DocumentUpload.js
│   │   │   └── DocumentViewer.js
│   │   ├── Auth.js
│   │   └── UserProfile.js
│   ├── contexts/
│   │   └── ThemeContext.js
│   ├── firebase/
│   │   ├── auth.js
│   │   ├── config.js
│   │   ├── firestore.js
│   │   └── storage.js
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── constants/
│   └── App.js
├── package.json
└── README.md
```

## 🎯 Supported File Types

- **Documents**: PDF, DOC, DOCX, TXT, CSV
- **Spreadsheets**: XLS, XLSX
- **Presentations**: PPT, PPTX
- **Images**: JPEG, PNG, GIF, SVG
- **Archives**: ZIP, RAR

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aditya Kumar** - [GitHub](https://github.com/AdityaKumar00007)

## 🙏 Acknowledgments

- Firebase for providing excellent backend services
- Material-UI for the beautiful React components
- React community for continuous support and inspiration
