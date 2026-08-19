import React from 'react';
import { useAppStore } from '../stores/appStore';
import { api } from '../api/client';
import { Save, BookOpen, Edit3, ChevronRight, ZoomIn, ZoomOut, Copy, Lock, Unlock, ArrowLeft, ArrowRight, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

export const Toolbar: React.FC = () => {
  const { 
    currentFilePath, 
    viewMode, 
    setViewMode, 
    isDirty, 
    isSaving, 
    setSaving, 
    markSaved,
    currentContent,
    zoomLevel,
    setZoomLevel,
    syncScroll,
    toggleSyncScroll,
    isDarkMode,
    toggleTheme
  } = useAppStore();

  const navigate = useNavigate();

  const handleSave = async () => {
    if (!currentFilePath || !isDirty || isSaving) return;
    
    setSaving(true);
    try {
      await api.saveFile(currentFilePath, currentContent);
      markSaved();
    } catch (e) {
      console.error("Failed to save", e);
      alert("Failed to save file.");
    } finally {
      setSaving(false);
    }
  };

  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel + 10, 200));
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel - 10, 50));
  const handleZoomReset = () => setZoomLevel(100);

  const renderBreadcrumbs = () => {
    if (!currentFilePath) return null;
    const parts = currentFilePath.split('/');
    return (
      <div className="flex items-center text-sm text-gray-400">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span className={index === parts.length - 1 ? 'text-gray-200' : ''}>{part}</span>
            {index < parts.length - 1 && <ChevronRight size={14} className="mx-1" />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="h-14 bg-dark-900 border-b border-dark-700 flex items-center justify-between px-4">
      <div className="flex items-center space-x-2 flex-1 overflow-hidden">
        <div className="flex space-x-1 mr-2 bg-dark-800 rounded border border-dark-700 p-0.5">
          <button 
            onClick={() => navigate(-1)}
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-dark-700 rounded transition-colors"
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
          <button 
            onClick={() => navigate(1)}
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-dark-700 rounded transition-colors"
            title="Go Forward"
          >
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden whitespace-nowrap overflow-ellipsis">
          {renderBreadcrumbs()}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {currentFilePath && (
          <>
            <div className="flex bg-dark-800 rounded-lg p-1 border border-dark-700 items-center">
              <button 
                onClick={handleZoomOut}
                className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button 
                onClick={handleZoomReset}
                className="px-2 text-xs font-mono text-gray-400 hover:text-gray-200 transition-colors min-w-[3rem]"
                title="Reset Zoom"
              >
                {zoomLevel}%
              </button>
              <button 
                onClick={handleZoomIn}
                className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            <div className="flex items-center text-xs text-gray-400">
              {isSaving ? 'Saving...' : isDirty ? 'Unsaved changes' : 'Saved'}
            </div>

            <div className="flex space-x-1">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(currentContent);
                  alert("Markdown copied to clipboard!");
                }}
                className="p-2 text-gray-500 hover:text-accent-purple transition-colors rounded hover:bg-dark-800"
                title="Copy Markdown"
              >
                <Copy size={18} />
              </button>
              
              <button 
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className={clsx(
                  "p-2 rounded transition-colors flex items-center justify-center",
                  isDirty ? "bg-accent-neon/10 text-accent-neon hover:bg-accent-neon/20" : "text-gray-500"
                )}
                title="Save (Ctrl+S)"
              >
                <Save size={18} />
              </button>
            </div>
            
            <div className="flex bg-dark-800 rounded-lg p-1 border border-dark-700">
              {viewMode === 'split' && (
                <button
                  onClick={toggleSyncScroll}
                  className={clsx(
                    "p-1.5 mr-2 rounded transition-colors flex items-center justify-center",
                    syncScroll ? "text-accent-purple hover:bg-dark-700" : "text-gray-500 hover:text-gray-300 hover:bg-dark-700"
                  )}
                  title={syncScroll ? "Sync Scroll Enabled" : "Sync Scroll Disabled"}
                >
                  {syncScroll ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
              )}
              <button 
                onClick={() => setViewMode('read')}
                className={clsx(
                  "flex items-center space-x-2 px-3 py-1 rounded-md transition-colors text-sm font-medium",
                  viewMode === 'read' ? "bg-dark-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"
                )}
              >
                <BookOpen size={14} />
                <span>Read</span>
              </button>
              <button 
                onClick={() => setViewMode('split')}
                className={clsx(
                  "p-1.5 rounded transition-colors",
                  viewMode === 'split' ? "bg-dark-700 text-white" : "text-gray-500 hover:text-gray-300 hover:bg-dark-700"
                )}
                title="Split View"
              >
                <div className="flex space-x-[1px]">
                  <BookOpen size={16} />
                  <Edit3 size={16} />
                </div>
              </button>
              <button 
                onClick={() => setViewMode('edit')}
                className={clsx(
                  "flex items-center space-x-2 px-3 py-1 rounded-md transition-colors text-sm font-medium",
                  viewMode === 'edit' ? "bg-dark-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"
                )}
              >
                <Edit3 size={14} />
                <span>Edit</span>
                {viewMode === 'edit' && <span className="w-1.5 h-1.5 rounded-full bg-accent-pink ml-1"></span>}
              </button>
            </div>
            <div className="h-6 w-px bg-dark-700 mx-1"></div>

            <a 
              href="https://github.com/meibraransari/markdown-manager.git"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-white hover:bg-dark-800 rounded transition-colors"
              title="GitHub Repository"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path></svg>
            </a>

            <button 
              onClick={toggleTheme}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-dark-800 rounded transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
