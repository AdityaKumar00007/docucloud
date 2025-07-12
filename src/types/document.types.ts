export interface DocumentType {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  description?: string;
  createdAt: Date | number;
  updatedAt?: Date | number;
  ownerId: string;
}

export interface DocumentUploadProgressType {
  loaded: number;
  total: number;
  progress: number;
}

export interface DocumentUploadResultType {
  id: string;
  url: string;
}

export interface DocumentListFilterType {
  searchTerm?: string;
  fileType?: string;
  sortBy?: 'name' | 'createdAt' | 'size';
  sortDirection?: 'asc' | 'desc';
}