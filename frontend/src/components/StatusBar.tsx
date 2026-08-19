import React from 'react';
import { useAppStore } from '../stores/appStore';

export const StatusBar: React.FC = () => {
  const content = useAppStore(state => state.currentContent);
  const currentFilePath = useAppStore(state => state.currentFilePath);
  const isSaving = useAppStore(state => state.isSaving);
  
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
      
      <div className="flex items-center space-x-4 ml-auto">
        {useAppStore.getState().isVimMode && (
          <div id="vim-status" className="font-mono text-accent-pink bg-dark-900 px-2 py-0.5 rounded border border-dark-700 min-w-[100px]" />
        )}
        <div className="flex space-x-4">
          <span className="flex items-center">
            {isSaving ? 'Saving...' : 'Saved'}
          </span>
          {currentFilePath && <span className="opacity-50 border-l border-dark-600 pl-4">{currentFilePath}</span>}
        </div>
      </div>
    </div>
  );
};
