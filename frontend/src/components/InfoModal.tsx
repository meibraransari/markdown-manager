import React from 'react';
import { useAppStore } from '../stores/appStore';
import { X, Keyboard, FileText, Layers, Download, Printer } from 'lucide-react';

export const InfoModal: React.FC = () => {
  const isOpen = useAppStore(state => state.isInfoOpen);
  const setOpen = useAppStore(state => state.setInfoOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-dark-700 flex justify-between items-center bg-dark-900">
          <h2 className="text-lg font-semibold text-gray-200 flex items-center">
            <Keyboard className="mr-2 text-accent-purple" size={20} />
            Info & Shortcuts
          </h2>
          <button 
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh] text-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div>
              <h3 className="text-accent-pink font-medium flex items-center mb-4">
                <FileText className="mr-2" size={16} />
                Editor Shortcuts
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between items-center border-b border-dark-700 pb-2">
                  <span>Save File</span>
                  <kbd className="bg-dark-900 px-2 py-1 rounded text-gray-400 font-mono text-xs border border-dark-600">Ctrl + S</kbd>
                </li>
                <li className="flex justify-between items-center border-b border-dark-700 pb-2">
                  <span>Find & Replace</span>
                  <kbd className="bg-dark-900 px-2 py-1 rounded text-gray-400 font-mono text-xs border border-dark-600">Ctrl + F</kbd>
                </li>
                <li className="flex justify-between items-center border-b border-dark-700 pb-2">
                  <span>Command Palette</span>
                  <kbd className="bg-dark-900 px-2 py-1 rounded text-gray-400 font-mono text-xs border border-dark-600">F1</kbd>
                </li>
                <li className="flex justify-between items-center border-b border-dark-700 pb-2">
                  <span>Toggle Line Comment</span>
                  <kbd className="bg-dark-900 px-2 py-1 rounded text-gray-400 font-mono text-xs border border-dark-600">Ctrl + /</kbd>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-accent-neon font-medium flex items-center mb-4">
                <Layers className="mr-2" size={16} />
                Features
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-neon mt-1.5 mr-2 shrink-0"></div>
                  <span><strong>Auto-Save:</strong> Click the pink refresh icon in the toolbar to automatically save changes as you type (every 2s).</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-neon mt-1.5 mr-2 shrink-0"></div>
                  <span><strong>Sync Scroll:</strong> In Split view, lock/unlock scrolling between the editor and the preview pane.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-neon mt-1.5 mr-2 shrink-0"></div>
                  <span><strong>Table of Contents:</strong> Use the numbered list icon in the editor toolbar to auto-generate a TOC from your headers.</span>
                </li>
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-accent-purple font-medium flex items-center mb-4">
                <Download className="mr-2" size={16} />
                Export to PDF
              </h3>
              <p className="text-sm text-gray-400">
                To save your Markdown as a clean PDF or HTML file, use the <Printer size={14} className="inline mx-1" /> Print button in the top right. 
                When the browser print dialog opens, set the destination to <strong>"Save as PDF"</strong>. The UI will automatically hide the sidebars and editor so only your rendered document is exported!
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
