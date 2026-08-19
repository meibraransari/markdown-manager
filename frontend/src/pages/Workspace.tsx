import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Sidebar } from '../components/Sidebar';
import { Toolbar } from '../components/Toolbar';
import { MarkdownReader } from '../markdown/MarkdownReader';
import { MarkdownEditor } from '../editor/MarkdownEditor';
import { useAppStore } from '../stores/appStore';
import { api } from '../api/client';

export const Workspace: React.FC = () => {
  const { "*": path } = useParams();
  const { 
    setFileTree, 
    setCurrentFile, 
    currentContent, 
    viewMode,
    currentFilePath
  } = useAppStore();

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const tree = await api.getTree();
        setFileTree(tree);
      } catch (e) {
        console.error("Failed to load file tree", e);
      }
    };
    fetchTree();
  }, [setFileTree]);

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

  return (
    <Layout>
      <Sidebar />
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        <Toolbar />
        <div className="flex-1 overflow-hidden w-full flex">
          {!currentFilePath ? (
            <div className="flex items-center justify-center h-full w-full text-gray-500">
              Select a file from the sidebar to start
            </div>
          ) : viewMode === 'split' ? (
            <div className="flex w-full h-full relative select-none" ref={containerRef}>
              <div 
                className="h-full overflow-hidden"
                style={{ width: `${splitRatio}%` }}
              >
                <div className={isDragging ? 'pointer-events-none' : ''} style={{ height: '100%' }}>
                  <MarkdownEditor key={`edit-${currentFilePath}`} />
                </div>
              </div>
              
              <div 
                className={`w-1 z-10 cursor-col-resize bg-dark-700 hover:bg-accent-neon transition-colors ${isDragging ? 'bg-accent-neon' : ''}`}
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
            <div className="w-full h-full overflow-y-auto">
              <MarkdownReader content={currentContent} />
            </div>
          ) : (
            <div className="w-full h-full overflow-hidden">
              <MarkdownEditor key={`edit-${currentFilePath}`} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
