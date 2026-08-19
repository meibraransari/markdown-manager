import React from 'react';
import { useAppStore } from '../stores/appStore';
import { X, Settings } from 'lucide-react';
import Editor from '@monaco-editor/react';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setSettingsOpen, customCss, setCustomCss, templateFolder, setTemplateFolder, isPageView, setIsPageView, pageWidth, setPageWidth } = useAppStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-lg w-full max-w-3xl shadow-2xl flex flex-col h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <div className="flex items-center text-lg font-semibold text-gray-200">
            <Settings className="mr-2 text-accent-pink" size={24} />
            Settings
          </div>
          <button onClick={() => setSettingsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Daily Notes</h3>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400 w-32">Template Folder:</label>
              <input 
                type="text" 
                value={templateFolder}
                onChange={e => setTemplateFolder(e.target.value)}
                placeholder="e.g. Templates"
                className="flex-1 bg-dark-900 border border-dark-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent-neon"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">When creating a Daily Note, the app will look for a template at \{templateFolder}/Daily.md\.</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Reading View</h3>
            <div className="flex flex-col space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isPageView} 
                  onChange={(e) => setIsPageView(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-accent-pink rounded border-dark-600 bg-dark-900 focus:ring-accent-pink focus:ring-offset-dark-800"
                />
                <span className="text-sm text-gray-400">Enable Page View (MS Word style centered paper)</span>
              </label>
              
              {isPageView && (
                <div className="flex items-center gap-4 pl-7">
                  <label className="text-sm text-gray-400 w-24">Page Width:</label>
                  <input 
                    type="range" 
                    min="400" 
                    max="1600" 
                    step="50"
                    value={pageWidth}
                    onChange={(e) => setPageWidth(parseInt(e.target.value))}
                    className="flex-1 max-w-xs accent-accent-pink"
                  />
                  <span className="text-sm text-gray-400 w-16">{pageWidth}px</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-[300px]">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Custom CSS Snippets</h3>
            <p className="text-xs text-gray-500 mb-2">Inject your own CSS to customize the application. Changes apply instantly.</p>
            <div className="flex-1 border border-dark-600 rounded overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="css"
                theme="vs-dark"
                value={customCss}
                onChange={(value) => setCustomCss(value || '')}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  padding: { top: 12 }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
