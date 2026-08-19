import React from 'react';
import { useAppStore } from '../stores/appStore';

export const StatusBar: React.FC = () => {
  const content = useAppStore(state => state.currentContent);
  const currentFilePath = useAppStore(state => state.currentFilePath);
  
  if (!currentFilePath) return null;

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="h-6 bg-dark-900 border-t border-dark-700 flex items-center justify-between px-4 text-[11px] text-gray-500 font-mono select-none z-50 relative shrink-0">
      <div className="flex space-x-4">
        <span>{wordCount} words</span>
        <span>{charCount} chars</span>
        <span>{readTime} min read</span>
      </div>
      <div>
        Markdown Manager
      </div>
    </div>
  );
};
