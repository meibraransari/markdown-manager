import { create } from 'zustand';
import type { FileNode } from '../api/client';

export type ViewMode = 'read' | 'edit' | 'split';

interface AppState {
  fileTree: FileNode[];
  currentFilePath: string | null;
  currentContent: string;
  originalContent: string;
  viewMode: ViewMode;
  isDirty: boolean;
  isSaving: boolean;
  searchQuery: string;
  zoomLevel: number;
  syncScroll: boolean;
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  autoSave: boolean;
  isInfoOpen: boolean;
  isSearchOpen: boolean;
  
  setFileTree: (tree: FileNode[]) => void;
  setCurrentFile: (path: string, content: string) => void;
  updateContent: (content: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setSaving: (saving: boolean) => void;
  markSaved: () => void;
  setSearchQuery: (query: string) => void;
  setZoomLevel: (zoom: number) => void;
  toggleSyncScroll: () => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  toggleAutoSave: () => void;
  setInfoOpen: (isOpen: boolean) => void;
  setSearchOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  fileTree: [],
  currentFilePath: null,
  currentContent: '',
  originalContent: '',
  viewMode: 'read',
  isDirty: false,
  isSaving: false,
  searchQuery: '',
  zoomLevel: 100,
  syncScroll: true,
  isSidebarOpen: true,
  isDarkMode: true,
  autoSave: true,
  isInfoOpen: false,
  isSearchOpen: false,

  setFileTree: (tree) => set({ fileTree: tree }),
  
  setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),

  setCurrentFile: (path, content) => set({ 
    currentFilePath: path, 
    currentContent: content, 
    originalContent: content,
    isDirty: false,
    viewMode: 'read'
  }),

  updateContent: (content) => set((state) => ({ 
    currentContent: content,
    isDirty: content !== state.originalContent 
  })),

  setViewMode: (mode) => set({ viewMode: mode }),
  
  setSaving: (saving) => set({ isSaving: saving }),
  
  markSaved: () => set((state) => ({ 
    originalContent: state.currentContent, 
    isDirty: false, 
    isSaving: false 
  })),

  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),

  toggleSyncScroll: () => set((state) => ({ syncScroll: !state.syncScroll })),
  
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  toggleTheme: () => set((state) => {
    const newTheme = !state.isDarkMode;
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { isDarkMode: newTheme };
  }),

  toggleAutoSave: () => set((state) => ({ autoSave: !state.autoSave })),
  setInfoOpen: (isOpen: boolean) => set({ isInfoOpen: isOpen }),
  setSearchOpen: (isOpen: boolean) => set({ isSearchOpen: isOpen })
}));
