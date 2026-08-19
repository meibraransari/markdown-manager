import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Sidebar } from '../components/Sidebar';
import { Toolbar } from '../components/Toolbar';
import { StatusBar } from '../components/StatusBar';
import { InfoModal } from '../components/InfoModal';
import { MarkdownReader } from '../markdown/MarkdownReader';
import { MarkdownEditor } from '../editor/MarkdownEditor';
import { useAppStore } from '../stores/appStore';
import { api } from '../api/client';

export const Workspace: React.FC = () => {
  const { "*": path } = useParams();
  const navigate = useNavigate();
  const { 
    setFileTree, 
    setCurrentFile, 
    viewMode,
    isDirty,
    markSaved,
    isSaving,
    setSaving,
    autoSave,
    currentContent,
    currentFilePath
  } = useAppStore();


  useEffect(() => {
    const fetchTree = async () => {
      try {
        const tree = await api.getTree();
        setFileTree(tree);
        
        // Auto-redirect to README.md if we are at root
        if (!path) {
          const findReadme = (nodes: any[]): any => {
            for (const node of nodes) {
              if (!node.is_directory && node.name.toLowerCase() === 'readme.md') {
                return node;
              }
              if (node.is_directory && node.children) {
                const childReadme = findReadme(node.children);
                if (childReadme) return childReadme;
              }
            }
            return null;
          };
          const readmeNode = findReadme(tree);
          if (readmeNode) {
            navigate(`/${readmeNode.path}`);
          }
        }
      } catch (e) {
        console.error("Failed to load file tree", e);
      }
    };
    fetchTree();
  }, [setFileTree, path, navigate]);

  useEffect(() => {
    const loadFile = async () => {
      if (path && path !== currentFilePath) {
        try {
          const file = await api.getFile(path);
          setCurrentFile(path, file.content);
        } catch (e) {
          console.error("Failed to load file", e);
        }
      }
    };
    loadFile();
  }, [path, currentFilePath, setCurrentFile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        if (viewMode === 'read') {
          e.preventDefault();
          useAppStore.getState().setSearchOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode]);

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const sync = useAppStore.getState().syncScroll;
    if (!sync || (window as any).isScrollingPreview) return;
    
    const target = e.target as HTMLDivElement;
    (window as any).isScrollingEditor = true;
    
    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
    if ((window as any).scrollToEditorPercentage) {
      (window as any).scrollToEditorPercentage(percentage);
    }
    
    setTimeout(() => { (window as any).isScrollingEditor = false; }, 50);
  };

  const [splitRatio, setSplitRatio] = React.useState(50);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const { left, width } = containerRef.current.getBoundingClientRect();
      const newRatio = ((e.clientX - left) / width) * 100;
      if (newRatio > 10 && newRatio < 90) setSplitRatio(newRatio);
    };
    const handleMouseUp = () => setIsDragging(false);
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (!autoSave || !isDirty || !currentFilePath || isSaving) return;

    const timeout = setTimeout(async () => {
      setSaving(true);
      try {
        await api.saveFile(currentFilePath, currentContent);
        markSaved();
      } catch (e) {
        console.error("Auto-save failed", e);
      } finally {
        setSaving(false);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [autoSave, isDirty, currentFilePath, currentContent, isSaving, markSaved, setSaving]);

  return (
    <Layout>
      <div id="sidebar" className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden print-container">
        <div id="toolbar" className="print:hidden">
          <Toolbar />
        </div>
        <div className="flex-1 overflow-hidden w-full flex print-container">
          {!currentFilePath ? (
            <div className="flex items-center justify-center h-full w-full text-gray-500">
              Select a file from the sidebar to start
            </div>
          ) : viewMode === 'split' ? (
            <div className="flex w-full h-full relative select-none print-container" ref={containerRef}>
              <div 
                className="h-full overflow-hidden editor-pane"
                style={{ width: `${splitRatio}%` }}
              >
                <div className={isDragging ? 'pointer-events-none' : ''} style={{ height: '100%' }}>
                  <MarkdownEditor key={`edit-${currentFilePath}`} />
                </div>
              </div>
              
              <div 
                className={`w-1 z-10 cursor-col-resize bg-dark-700 hover:bg-accent-neon transition-colors resizer ${isDragging ? 'bg-accent-neon' : ''}`}
                onMouseDown={handleMouseDown}
              ></div>

              <div 
                id="preview-pane"
                className="h-full overflow-y-auto bg-dark-900"
                style={{ width: `calc(${100 - splitRatio}% - 4px)` }}
                onScroll={handlePreviewScroll}
              >
                <div className={isDragging ? 'pointer-events-none' : ''} style={{ height: '100%' }}>
                  <MarkdownReader content={currentContent} />
                </div>
              </div>
            </div>
          ) : viewMode === 'read' ? (
            <div id="preview-pane" className="w-full h-full overflow-y-auto bg-dark-900">
              <MarkdownReader content={currentContent} />
            </div>
          ) : (
            <div className="w-full h-full overflow-hidden editor-pane">
              <MarkdownEditor key={`edit-${currentFilePath}`} />
            </div>
          )}
        </div>
        <div id="statusbar" className="print:hidden">
          <StatusBar />
        </div>
      </div>
      <div className="info-modal print:hidden">
        <InfoModal />
      </div>
    </Layout>
  );
};
