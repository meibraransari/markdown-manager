import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { api } from '../api/client';
import { Save, BookOpen, Edit3, ChevronRight, ZoomIn, ZoomOut, Copy, Lock, Unlock, ArrowLeft, ArrowRight, Printer, Info, RefreshCw, Home, ChevronDown, Download, CheckSquare, LayoutList } from 'lucide-react';
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
    theme,
    setTheme,
    autoSave,
    toggleAutoSave,
    setInfoOpen,
    isTasksOpen, setTasksOpen,
    isPageView, setIsPageView,
    pageWidth, setPageWidth
  } = useAppStore();

  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeOptions = [
    { value: 'theme-dark', label: 'Dark (Default)' },
    { value: 'theme-light', label: 'Light' },
    { value: 'theme-obsidian', label: 'Obsidian' },
    { value: 'theme-dracula', label: 'Dracula' },
    { value: 'theme-nord', label: 'Nord' },
    { value: 'theme-monokai', label: 'Monokai' },
    { value: 'theme-github-dark', label: 'GitHub Dark' },
    { value: 'theme-solarized-dark', label: 'Solarized Dark' },
    { value: 'theme-gruvbox', label: 'Gruvbox' },
    { value: 'theme-onedark', label: 'One Dark' }
  ];

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

  const handleExportHTML = () => {
    const previewPane = document.getElementById('preview-pane');
    if (!previewPane) {
      alert("Please switch to Read or Split mode to generate HTML export.");
      return;
    }
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${currentFilePath}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 2rem; }
    @media (prefers-color-scheme: dark) {
      body { background-color: #1a1a1a; color: #e5e5e5; }
      a { color: #58a6ff; }
      code { background: #2d2d2d; padding: 0.2em 0.4em; border-radius: 3px; }
      pre code { background: none; padding: 0; }
      pre { background: #0d1117; padding: 16px; border-radius: 6px; overflow: auto; }
      blockquote { border-left: 4px solid #30363d; padding-left: 1em; color: #8b949e; }
    }
  </style>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
</head>
<body>
  ${previewPane.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFilePath?.split('/').pop()?.replace('.md', '') || 'export'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            onClick={() => navigate('/')}
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-dark-700 rounded transition-colors"
            title="Go to Home (README.md)"
          >
            <Home size={16} />
          </button>
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

              <button 
                onClick={toggleAutoSave}
                className={clsx(
                  "p-2 rounded transition-colors flex items-center justify-center",
                  autoSave ? "text-accent-pink bg-accent-pink/10" : "text-gray-500 hover:text-gray-300"
                )}
                title={autoSave ? "Auto-Save Enabled" : "Auto-Save Disabled"}
              >
                <RefreshCw size={18} />
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
              {(viewMode === 'read' || viewMode === 'split') && (
                <div className="flex items-center">
                  <button
                    onClick={() => setIsPageView(!isPageView)}
                    className={clsx(
                      "flex items-center space-x-1 px-2 py-1 rounded-md transition-colors text-xs font-medium ml-1 border border-dark-600",
                      isPageView ? "bg-accent-blue/20 text-accent-blue border-accent-blue/30" : "text-gray-400 hover:text-gray-200 bg-dark-700"
                    )}
                    title={isPageView ? "Disable Page View" : "Enable Page View (MS Word style)"}
                  >
                    <LayoutList size={12} />
                    <span className="hidden sm:inline">Page</span>
                  </button>
                  {isPageView && (
                    <div className="flex items-center ml-2 px-2 py-1 bg-dark-700 rounded-md border border-dark-600 h-[26px]">
                      <input 
                        type="range" 
                        min="400" 
                        max="1600" 
                        step="50"
                        value={pageWidth}
                        onChange={(e) => setPageWidth(parseInt(e.target.value))}
                        className="w-16 h-1 accent-accent-blue"
                        title="Page Width"
                      />
                      <span className="text-[10px] text-gray-400 ml-2 w-8 hidden sm:inline">{pageWidth}px</span>
                    </div>
                  )}
                </div>
              )}
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
              
              <div className="w-px h-5 bg-dark-600 mx-1 self-center hidden"></div>
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
              onClick={() => window.print()}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-dark-800 rounded transition-colors"
              title="Print / Save as PDF"
            >
              <Printer size={18} />
            </button>

            <button 
              onClick={() => {
                const blob = new Blob([currentContent], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = currentFilePath ? currentFilePath.split('/').pop() || 'document.md' : 'document.md';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-dark-800 rounded transition-colors"
              title="Download Markdown"
            >
              <Download size={18} />
            </button>

            <button 
              onClick={handleExportHTML}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-dark-800 rounded transition-colors"
              title="Export HTML"
            >
              <div className="flex items-center">
                <Download size={14} className="mr-1" />
                <span className="text-[10px] font-bold">HTML</span>
              </div>
            </button>
            
            <button 
              onClick={() => setTasksOpen(!isTasksOpen)}
              className={`p-1.5 rounded transition-colors ${isTasksOpen ? 'bg-accent-green/20 text-accent-green' : 'text-gray-400 hover:text-white hover:bg-dark-700'}`}
              title="Task Dashboard"
            >
              <CheckSquare size={16} />
            </button>

            <button 
              onClick={() => setInfoOpen(true)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-dark-800 rounded transition-colors"
              title="Info & Shortcuts"
            >
              <Info size={18} />
            </button>

            <div className="relative flex items-center" ref={themeDropdownRef}>
              <button
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                className="flex items-center justify-between w-36 bg-dark-800 border border-dark-600 text-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-accent-purple hover:bg-dark-700 transition-colors shadow-sm"
                title="Select Theme"
              >
                <span className="truncate">{themeOptions.find(t => t.value === theme)?.label || 'Theme'}</span>
                <ChevronDown size={14} className={clsx("transition-transform duration-200", isThemeDropdownOpen && "rotate-180")} />
              </button>

              {isThemeDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-dark-800 border border-dark-600 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {themeOptions.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => {
                          setTheme(t.value);
                          setIsThemeDropdownOpen(false);
                        }}
                        className={clsx(
                          "w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-dark-700",
                          theme === t.value ? "text-accent-neon font-medium bg-dark-700/50" : "text-gray-300"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
