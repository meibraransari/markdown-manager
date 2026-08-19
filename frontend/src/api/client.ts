import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  last_modified?: number;
  children?: FileNode[];
}

export interface FileContent {
  content: string;
  last_modified: number;
}

export interface SearchResult {
  path: string;
  line_number?: number;
  match_context: string;
}

export const api = {
  getTree: async (): Promise<FileNode[]> => {
    const response = await apiClient.get<FileNode[]>('/tree');
    return response.data;
  },
  getFile: async (path: string): Promise<FileContent> => {
    const encoded = encodeURIComponent(path);
    const response = await apiClient.get<FileContent>(`/files/${encoded}`);
    return response.data;
  },
  saveFile: async (path: string, content: string): Promise<{message: string; last_modified: number}> => {
    const encoded = encodeURIComponent(path);
    const response = await apiClient.put(`/files/${encoded}`, { content });
    return response.data;
  },
  createItem: async (path: string, is_directory: boolean = false, content: string = ""): Promise<void> => {
    const encoded = encodeURIComponent(path);
    await apiClient.post(`/files/${encoded}`, { is_directory, content });
  },
  deleteItem: async (path: string): Promise<void> => {
    const encoded = encodeURIComponent(path);
    await apiClient.delete(`/files/${encoded}`);
  },
  renameItem: async (oldPath: string, newPath: string): Promise<void> => {
    const encoded = encodeURIComponent(oldPath);
    await apiClient.patch(`/files/${encoded}/rename`, { new_path: newPath });
  },
  search: async (query: string): Promise<SearchResult[]> => {
    const response = await apiClient.get<SearchResult[]>('/search', { params: { q: query } });
    return response.data;
  }
};
