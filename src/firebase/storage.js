import { ref, uploadBytesResumable, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage';
import { storage, db, auth } from './config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// Upload a file to Firebase Storage with improved error handling
export const uploadFile = async (file, onProgress) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to upload files');
    }

    // Create a storage reference
    const storageRef = ref(storage, `documents/${currentUser.uid}/${file.name}`);
    
    // Set proper metadata
    const metadata = {
      contentType: file.type
    };
    
    // Create upload task with proper metadata
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress && onProgress({ 
            loaded: snapshot.bytesTransferred, 
            total: snapshot.totalBytes, 
            progress 
          });
        },
        (error) => {
          // Handle specific upload errors with clear messages
          if (error.code === 'storage/unauthorized') {
            reject(new Error('Permission denied. Check your Firebase Storage rules.'));
          } else if (error.code === 'storage/canceled') {
            reject(new Error('Upload was cancelled.'));
          } else if (error.code === 'storage/unknown') {
            reject(new Error('An unknown error occurred. This may be a CORS issue.'));
          } else {
            reject(error);
          }
        },
        async () => {
          try {
            // Upload completed successfully
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Add document metadata to Firestore
            const docRef = await addDoc(collection(db, 'documents'), {
              name: file.name,
              type: file.type,
              size: file.size,
              url: downloadURL,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
              ownerId: currentUser.uid
            });
            
            resolve({ url: downloadURL, id: docRef.id });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    throw error;
  }
};

// Delete a file from Firebase Storage
export const deleteFile = async (fileUrl) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to delete files');
    }

    // Create a storage reference from the file URL
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    throw error;
  }
};

// Get file metadata from Firebase Storage
export const getFileMetadata = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    const metadata = await getMetadata(fileRef);
    return metadata;
  } catch (error) {
    throw error;
  }
};