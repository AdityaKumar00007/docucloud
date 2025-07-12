import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from './config';
import { deleteFile } from './storage';

// Add document metadata to Firestore
export const addDocument = async (documentData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to add documents');
    }

    const docRef = await addDoc(collection(db, 'documents'), {
      ...documentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ownerId: currentUser.uid
    });

    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Get documents for current user
export const getDocuments = async (filters = {}) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to get documents');
    }

    let q = query(collection(db, 'documents'), where('ownerId', '==', currentUser.uid));
    
    // Apply sorting if specified
    if (filters.sortBy) {
      const direction = filters.sortDirection === 'desc' ? 'desc' : 'asc';
      q = query(q, orderBy(filters.sortBy, direction));
    } else {
      // Default sort by createdAt (newest first)
      q = query(q, orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      });
    });

    // Apply filtering for search term if specified
    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      return documents.filter(doc => 
        doc.name.toLowerCase().includes(searchTermLower) || 
        (doc.description && doc.description.toLowerCase().includes(searchTermLower))
      );
    }

    // Apply filtering for file type if specified
    if (filters.fileType) {
      return documents.filter(doc => doc.type.includes(filters.fileType));
    }

    return documents;
  } catch (error) {
    throw error;
  }
};

// Get a single document by ID
export const getDocument = async (id) => {
  try {
    const docRef = doc(db, 'documents', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate()
      };
    } else {
      throw new Error('Document not found');
    }
  } catch (error) {
    throw error;
  }
};

// Update document metadata
export const updateDocument = async (id, documentData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to update documents');
    }

    const docRef = doc(db, 'documents', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }

    // Check if user owns the document
    if (docSnap.data().ownerId !== currentUser.uid) {
      throw new Error('Not authorized to update this document');
    }

    await updateDoc(docRef, {
      ...documentData,
      updatedAt: Timestamp.now()
    });

    return true;
  } catch (error) {
    throw error;
  }
};

// Delete document and its file from storage
export const deleteDocument = async (id) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be logged in to delete documents');
    }

    const docRef = doc(db, 'documents', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }

    // Check if user owns the document
    if (docSnap.data().ownerId !== currentUser.uid) {
      throw new Error('Not authorized to delete this document');
    }

    // Delete the file from storage first
    if (docSnap.data().url) {
      await deleteFile(docSnap.data().url);
    }

    // Then delete the document metadata
    await deleteDoc(docRef);

    return true;
  } catch (error) {
    throw error;
  }
};