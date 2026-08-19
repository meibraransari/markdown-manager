import React, { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { Folder, File, ChevronRight, ChevronDown, FileText, Image as ImageIcon, Trash2, Edit3, Search, X, PanelLeftClose, PanelLeftOpen, Eye, EyeOff, ChevronsDown, ChevronsUp, Calendar, Settings, Upload } from 'lucide-react';
import { OutlinePanel } from './OutlinePanel';
import { TagsPanel } from './TagsPanel';
import type { FileNode, SearchResult } from '../api/client';
import { api } from '../api/client';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

const FileTreeItem: React.FC<{ node: FileNode; level: number; search: string; expandSignal: number; collapseSignal: number; onRequestDelete: (node: FileNode) => void }> = ({ node, level, search, expandSignal, collapseSignal, onRequestDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentFilePath = useAppStore(state => state.currentFilePath);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (expandSignal > 0 && node.type === 'directory') setIsOpen(true);
  }, [expandSignal, node.type]);

  React.useEffect(() => {
    if (collapseSignal > 0 && node.type === 'directory') setIsOpen(false);
  }, [collapseSignal, node.type]);

  const isSelected = currentFilePath === node.path;
  const isDir = node.type === 'directory';
  const isMarkdown = node.name.toLowerCase().endsWith('.md');
  const isImage = /\.(png|jpe?g|gif|svg|webp)$/i.test(node.name);

  const effectivelyOpen = (isDir && search.length > 0) || isOpen;

  const handleClick = () => {
    if (isDir) {
      setIsOpen(!effectivelyOpen);
    } else {
      const parts = node.path.split('/').map(encodeURIComponent);
      navigate(`/${parts.join('/')}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestDelete(node);
  };

  return (
    <div>
      <div 
        className={clsx(
          "flex items-center py-1 px-2 cursor-pointer hover:bg-dark-700 rounded text-sm transition-colors group",
          isSelected ? "bg-dark-700 text-accent-neon" : "text-gray-400 hover:text-gray-200"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        <div className="w-4 h-4 mr-1 flex items-center justify-center">
          {isDir ? (
            effectivelyOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : null}
        </div>
        
        {isDir ? (
          <Folder size={14} className="mr-2 text-accent-purple" />
        ) : isMarkdown ? (
          <FileText size={14} className="mr-2 text-accent-neon" />
        ) : isImage ? (
          <ImageIcon size={14} className="mr-2 text-accent-pink" />
        ) : (
          <File size={14} className="mr-2 text-gray-500" />
        )}
        
        <span className="truncate flex-1">{node.name}</span>

        {!isDir && (
          <div className="hidden group-hover:flex items-center ml-2">
            <button 
              onClick={async (e) => {
                e.stopPropagation();
                const newName = window.prompt("Rename file:", node.name);
                if (newName && newName !== node.name) {
                  try {
                    const newPath = node.path.substring(0, node.path.lastIndexOf('/') + 1) + newName;
                    await api.renameItem(node.path, newPath);
                    const tree = await api.getTree();
                    useAppStore.getState().setFileTree(tree);
                    if (isSelected) {
                      navigate(`/${newPath.split('/').map(encodeURIComponent).join('/')}`);
                    }
                  } catch (e: any) {
                    alert("Failed to rename item");
                  }
                }
              }}
              className="p-1 text-gray-500 hover:text-accent-neon transition-colors"
              title="Rename File"
            >
              <Edit3 size={14} />
            </button>
            <button 
              onClick={handleDelete}
              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
              title="Delete File"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {isDir && effectivelyOpen && node.children && (
        <div>
          {node.children.map((child, i) => (
            <FileTreeItem 
              key={i} 
              node={child} 
              level={level + 1} 
              search={search} 
              expandSignal={expandSignal} 
              collapseSignal={collapseSignal} 
              onRequestDelete={onRequestDelete}
            />))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const fileTree = useAppStore(state => state.fileTree);
  const setFileTree = useAppStore(state => state.setFileTree);
  const { isSidebarOpen, toggleSidebar, isSearchOpen, setSearchOpen, showHiddenFiles, toggleHiddenFiles, searchQuery: globalSearchQuery, setSearchQuery: setGlobalSearchQuery, setSettingsOpen, templateFolder } = useAppStore();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandSignal, setExpandSignal] = useState(0);
  const [collapseSignal, setCollapseSignal] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<FileNode | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await api.uploadFile(file);
      const tree = await api.getTree(showHiddenFiles);
      setFileTree(tree);
    } catch (e) {
      console.error(e);
      alert("Failed to upload file.");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    try {
      for (const file of files) {
        await api.uploadFile(file);
      }
      const tree = await api.getTree(showHiddenFiles);
      setFileTree(tree);
    } catch (error) {
      console.error('Failed to upload files:', error);
      alert('Failed to upload files.');
    }
  };

  const handleDailyNote = async () => {
    try {
      const path = await api.createDailyNote(templateFolder);
      navigate(`/${path.split('/').map(encodeURIComponent).join('/')}`);
    } catch (e) {
      console.error(e);
      alert("Failed to create daily note.");
    }
  };

  if (!isSidebarOpen) {
    return (
      <div className="w-12 flex-shrink-0 bg-dark-800 border-r border-dark-700 flex flex-col h-full items-center py-4">
        <button 
          onClick={toggleSidebar} 
          className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded transition-colors"
          title="Show Sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
      </div>
    );
  }

  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await api.search(globalSearchQuery);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
      alert("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const refreshTree = async () => {
    try {
      const tree = await api.getTree();
      setFileTree(tree);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFile = async () => {
    const name = window.prompt("Enter new file name (e.g. notes.md):");
    if (!name) return;
    try {
      await api.createItem(name, false, "# " + name.replace('.md', ''));
      refreshTree();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to create file");
    }
  };

  const handleCreateFolder = async () => {
    const name = window.prompt("Enter new folder name:");
    if (!name) return;
    try {
      await api.createItem(name, true);
      refreshTree();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to create folder");
    }
  };

  const filterTree = (nodes: FileNode[], query: string): FileNode[] => {
    if (!query) return nodes;
    const lowerQuery = query.toLowerCase();
    
    return nodes.map(node => {
      if (node.type === 'directory' && node.children) {
        const filteredChildren = filterTree(node.children, query);
        if (filteredChildren.length > 0 || node.name.toLowerCase().includes(lowerQuery)) {
          return { ...node, children: filteredChildren };
        }
        return null;
      }
      return node.name.toLowerCase().includes(lowerQuery) ? node : null;
    }).filter(Boolean) as FileNode[];
  };

  const visibleTree = filterTree(fileTree, search);

  const confirmDelete = async () => {
    if (!nodeToDelete) return;
    try {
      await api.deleteItem(nodeToDelete.path);
      const tree = await api.getTree(showHiddenFiles);
      setFileTree(tree);
      const currentFilePath = useAppStore.getState().currentFilePath;
      if (currentFilePath === nodeToDelete.path) {
        navigate('/');
      }
      setNodeToDelete(null);
    } catch (e: any) {
      alert("Failed to delete item");
    }
  };

  return (
    <>
      {nodeToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-dark-800 border border-dark-600 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Trash2 size={20} className="text-red-400" />
              Delete {nodeToDelete.type === 'directory' ? 'Folder' : 'File'}
            </h3>
            <p className="text-gray-400 mb-6 text-sm">
              Are you sure you want to delete <span className="font-semibold text-white">"{nodeToDelete.name}"</span>? 
              {nodeToDelete.type === 'directory' && " All contents inside this folder will be permanently deleted."}
              <br/><br/>
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setNodeToDelete(null)} 
                className="px-4 py-2 rounded text-sm font-medium text-gray-300 hover:text-white hover:bg-dark-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2 rounded text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-64 flex-shrink-0 bg-dark-800 border-r border-dark-700 flex flex-col h-full transition-all duration-300">
        <div className="p-4 border-b border-dark-700 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-neon whitespace-nowrap overflow-hidden">
              Markdown Manager
            </h1>
            <button 
              onClick={toggleSidebar} 
              className="p-1 text-gray-400 hover:text-white transition-colors" 
              title="Hide Sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
          <div className="flex items-center space-x-1">
            <button onClick={() => setSearchOpen(true)} className="flex-1 flex justify-center py-1.5 text-gray-400 hover:text-white bg-dark-900 hover:bg-dark-700 rounded transition-colors" title="Global Search">
              <Search size={16} />
            </button>
            <button 
              onClick={toggleHiddenFiles} 
              className={clsx(
                "flex-1 flex justify-center py-1.5 rounded transition-colors",
                showHiddenFiles ? "text-accent-pink bg-dark-700" : "text-gray-400 hover:text-white bg-dark-900 hover:bg-dark-700"
              )} 
              title={showHiddenFiles ? "Hide Hidden Files" : "Show All Files"}
            >
              {showHiddenFiles ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button onClick={handleCreateFile} className="flex-1 flex justify-center py-1.5 text-gray-400 hover:text-accent-neon bg-dark-900 hover:bg-dark-700 rounded transition-colors" title="New File">
              <FileText size={16} />
            </button>
            <button onClick={handleCreateFolder} className="flex-1 flex justify-center py-1.5 text-gray-400 hover:text-accent-purple bg-dark-900 hover:bg-dark-700 rounded transition-colors" title="New Folder">
              <Folder size={16} />
            </button>
            <button onClick={handleDailyNote} className="flex-1 flex justify-center py-1.5 text-gray-400 hover:text-accent-pink bg-dark-900 hover:bg-dark-700 rounded transition-colors" title="Today's Daily Note">
              <Calendar size={16} />
            </button>
            <button onClick={() => setSettingsOpen(true)} className="flex-1 flex justify-center py-1.5 text-gray-400 hover:text-gray-200 bg-dark-900 hover:bg-dark-700 rounded transition-colors" title="Settings">
              <Settings size={16} />
            </button>
          </div>
          <div className="flex items-center space-x-1 mt-2">
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex justify-center py-1.5 text-gray-400 hover:text-accent-neon bg-dark-900 hover:bg-dark-700 rounded transition-colors" title="Import File">
              <Upload size={16} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <button 
              onClick={() => setExpandSignal(s => s + 1)} 
              className="flex-1 flex justify-center py-1.5 text-gray-400 hover:text-white bg-dark-900 hover:bg-dark-700 rounded transition-colors" 
              title="Expand All Folders"
            >
              <ChevronsDown size={16} />
            </button>
            <button 
              onClick={() => setCollapseSignal(s => s + 1)} 
              className="flex-1 flex justify-center py-1.5 text-gray-400 hover:text-white bg-dark-900 hover:bg-dark-700 rounded transition-colors" 
              title="Collapse All Folders"
            >
              <ChevronsUp size={16} />
            </button>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Filter files..." 
              className="w-full bg-dark-900 border border-dark-600 rounded px-3 py-1.5 pr-8 text-sm focus:outline-none focus:border-accent-purple transition-colors"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-0.5 rounded-full hover:bg-dark-700"
                title="Clear Search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <div 
          className={clsx(
            "flex-1 overflow-y-auto p-2 transition-colors relative",
            isDragging && "bg-dark-700 ring-2 ring-inset ring-accent-purple"
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-800/80 backdrop-blur-sm z-10 text-accent-purple font-medium border-2 border-dashed border-accent-purple rounded m-2 pointer-events-none">
              <div className="flex flex-col items-center">
                <Upload size={32} className="mb-2" />
                <span>Drop files to import</span>
              </div>
            </div>
          )}
          {visibleTree.length > 0 ? (
            visibleTree.map((node, i) => (
              <FileTreeItem 
                key={i} 
                node={node} 
                level={0} 
                search={search} 
                expandSignal={expandSignal}
                collapseSignal={collapseSignal}
                onRequestDelete={(node) => setNodeToDelete(node)}
              />
            ))
            ) : (
              <div className="text-center text-sm text-gray-500 mt-4">No files match "{search}"</div>
            )}
        </div>
        <TagsPanel />
          <OutlinePanel />
        </div>

      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-24" onClick={() => setSearchOpen(false)}>
          <div className="bg-dark-800 border border-dark-700 rounded-lg w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleGlobalSearch} className="p-4 border-b border-dark-700 flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search file contents..."
                  className="w-full bg-dark-900 border border-dark-600 rounded px-4 py-2 pr-10 text-white focus:outline-none focus:border-accent-neon transition-colors"
                  value={globalSearchQuery}
                  onChange={e => setGlobalSearchQuery(e.target.value)}
                />
                {globalSearchQuery && (
                  <button 
                    type="button"
                    onClick={() => setGlobalSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1 rounded-full hover:bg-dark-700"
                    title="Clear Search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button type="submit" disabled={isSearching} className="px-4 py-2 bg-dark-700 text-white rounded hover:bg-dark-600 transition-colors disabled:opacity-50">
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>
            <div className="flex-1 overflow-y-auto p-4">
              {searchResults.length === 0 && !isSearching && (
                <div className="text-center text-gray-500 my-8">
                  {globalSearchQuery ? "No results found." : "Type a query to search inside all files."}
                </div>
              )}
              {searchResults.map((result, i) => (
                <div 
                  key={i} 
                  className="mb-4 p-3 bg-dark-900/50 rounded border border-dark-700 hover:border-dark-600 cursor-pointer transition-colors"
                  onClick={() => {
                    navigate(`/${result.path.split('/').map(encodeURIComponent).join('/')}`);
                    setSearchOpen(false);
                  }}
                >
                  <div className="text-accent-neon font-medium text-sm mb-1">{result.path} {result.line_number && `(Line ${result.line_number})`}</div>
                  <pre className="text-gray-300 text-xs overflow-x-auto whitespace-pre-wrap">{result.match_context}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
