import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CommitInfo {
  id: string;
  message: string;
  author: string;
  date: string;
}

export interface TaskItem {
  path: string;
  line_number: number;
  text: string;
  completed: boolean;
  context?: string;
}

export interface BacklinkItem {
  source_path: string;
  line_number: number;
  context: string;
}

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
  getTree: async (showHidden: boolean = false): Promise<FileNode[]> => {
    const response = await apiClient.get<FileNode[]>('/tree', { params: { show_hidden: showHidden } });
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
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.path;
  },
  getDownloadUrl: (path: string): string => {
    return `${API_BASE_URL}/download/${encodeURIComponent(path)}`;
  },
  uploadFile: async (file: File, relativePath?: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    if (relativePath) {
      formData.append('relativePath', relativePath);
    }
    const response = await apiClient.post('/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.path;
  },
  search: async (query: string): Promise<SearchResult[]> => {
    const response = await apiClient.get<SearchResult[]>('/search', { params: { q: query } });
    return response.data;
  },
  getGraph: async (): Promise<{ nodes: any[], links: any[] }> => {
    const response = await apiClient.get('/metadata/graph');
    return response.data;
  },
  getTags: async (): Promise<Record<string, string[]>> => {
    const response = await apiClient.get('/metadata/tags');
    return response.data;
  },
  getTasks: async (): Promise<TaskItem[]> => {
    const response = await apiClient.get<TaskItem[]>('/tasks');
    return response.data;
  },
  toggleTask: async (path: string, line_number: number, completed: boolean): Promise<any> => {
    const response = await apiClient.post('/tasks/toggle', { path, line_number, completed });
    return response.data;
  },
  getBacklinks: async (targetPath: string): Promise<BacklinkItem[]> => {
    const response = await apiClient.get<BacklinkItem[]>('/backlinks', { params: { target_path: targetPath } });
    return response.data;
  },
  getGitStatus: async (): Promise<string> => {
    const response = await apiClient.get('/git/status');
    return response.data.status;
  },
  gitCommit: async (message: string): Promise<string> => {
    const response = await apiClient.post('/git/commit', { message });
    return response.data.output;
  },
  getGitLog: async (): Promise<any[]> => {
    const response = await apiClient.get('/git/log');
    return response.data.commits;
  },
  createDailyNote: async (templateFolder: string): Promise<string> => {
    const response = await apiClient.post('/daily', { templateFolder });
    return response.data.path;
  }
};
