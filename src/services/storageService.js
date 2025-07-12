import { getDocuments } from '../firebase/firestore';
import { auth } from '../firebase/config';

export const getUserStorageStats = async () => {
  try {
    if (!auth.currentUser) {
      return {
        used: 0,
        total: 5 * 1024 * 1024 * 1024, // 5GB limit
        files: 0,
        documents: [],
      };
    }

    // Get all user documents
    const documents = await getDocuments();
    
    // Calculate total storage used
    const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
    
    // Group documents by type
    const documentsByType = documents.reduce((acc, doc) => {
      const type = getDocumentCategory(doc.type);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      used: totalSize,
      total: 5 * 1024 * 1024 * 1024, // 5GB limit
      files: documents.length,
      documents,
      breakdown: documentsByType,
      averageFileSize: documents.length > 0 ? totalSize / documents.length : 0,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      used: 0,
      total: 5 * 1024 * 1024 * 1024,
      files: 0,
      documents: [],
      breakdown: {},
      averageFileSize: 0,
    };
  }
};

const getDocumentCategory = (mimeType) => {
  if (mimeType.includes('pdf')) return 'PDFs';
  if (mimeType.includes('image')) return 'Images';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Documents';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Spreadsheets';
  if (mimeType.includes('presentation')) return 'Presentations';
  if (mimeType.includes('text')) return 'Text Files';
  return 'Other';
};

export const exportUserData = async () => {
  try {
    const stats = await getUserStorageStats();
    const userData = {
      user: {
        email: auth.currentUser?.email,
        displayName: auth.currentUser?.displayName,
        uid: auth.currentUser?.uid,
        emailVerified: auth.currentUser?.emailVerified,
        creationTime: auth.currentUser?.metadata?.creationTime,
        lastSignInTime: auth.currentUser?.metadata?.lastSignInTime,
      },
      storage: {
        totalFiles: stats.files,
        totalSize: stats.used,
        breakdown: stats.breakdown,
      },
      documents: stats.documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        description: doc.description,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      exportDate: new Date().toISOString(),
    };

    // Create and download JSON file
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cloud-doc-manager-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
};
