import React from 'react';
import { useAppStore } from '../stores/appStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, FileText } from 'lucide-react';
import { clsx } from 'clsx';

export const TabBar: React.FC = () => {
  const { openFiles, closeOpenFile } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = decodeURIComponent(location.pathname.slice(1));

  if (openFiles.length === 0) return null;

  const handleTabClick = (path: string) => {
    navigate(`/${path.split('/').map(encodeURIComponent).join('/')}`);
  };

  const handleClose = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    closeOpenFile(path);
    if (path === currentPath) {
      // If closing the active tab, navigate to the last available tab or root
      const newFiles = openFiles.filter(p => p !== path);
      if (newFiles.length > 0) {
        navigate(`/${newFiles[newFiles.length - 1].split('/').map(encodeURIComponent).join('/')}`);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="flex bg-dark-900 overflow-x-auto border-b border-dark-700 h-9 shrink-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {openFiles.map(path => {
        const isActive = path === currentPath;
        const filename = path.split('/').pop() || path;
        
        return (
          <div
            key={path}
            onClick={() => handleTabClick(path)}
            className={clsx(
              "group flex items-center min-w-max px-3 border-r border-dark-700 cursor-pointer select-none transition-colors",
              isActive 
                ? "bg-dark-800 text-accent-neon border-t-2 border-t-accent-neon" 
                : "bg-dark-900 text-gray-400 hover:bg-dark-800 border-t-2 border-t-transparent hover:text-gray-200"
            )}
            title={path}
          >
            <FileText size={14} className="mr-2 opacity-70" />
            <span className="text-sm font-medium mr-2">{filename}</span>
            <button
              onClick={(e) => handleClose(e, path)}
              className={clsx(
                "p-0.5 rounded-full hover:bg-dark-600 transition-colors",
                isActive ? "text-gray-300" : "text-gray-500 opacity-0 group-hover:opacity-100"
              )}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
