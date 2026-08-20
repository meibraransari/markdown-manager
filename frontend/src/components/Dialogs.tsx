import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Info, UploadCloud } from 'lucide-react';

export type PromptConfig = {
  title: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  onConfirm: (val: string) => void;
  onCancel: () => void;
};

export const PromptDialog: React.FC<{ config: PromptConfig | null }> = ({ config }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (config) {
      setValue(config.defaultValue || '');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [config]);

  if (!config) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-dark-800 border border-dark-600 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-white mb-2">{config.title}</h3>
        <p className="text-gray-400 mb-4 text-sm">{config.message}</p>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) config.onConfirm(value.trim());
        }}>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-dark-900 border border-dark-600 rounded px-3 py-2 text-white focus:outline-none focus:border-accent-blue transition-colors mb-6"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={config.placeholder}
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={config.onCancel}
              className="px-4 py-2 rounded text-sm font-medium text-gray-300 hover:text-white hover:bg-dark-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-4 py-2 rounded text-sm font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/20 hover:bg-accent-blue hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export type AlertConfig = {
  title: string;
  message: string;
  isError?: boolean;
  onClose: () => void;
};

export const AlertDialog: React.FC<{ config: AlertConfig | null }> = ({ config }) => {
  if (!config) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-dark-800 border border-dark-600 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          {config.isError ? <AlertCircle size={20} className="text-red-400" /> : <Info size={20} className="text-accent-blue" />}
          {config.title}
        </h3>
        <p className="text-gray-400 mb-6 text-sm">{config.message}</p>
        <div className="flex justify-end">
          <button
            onClick={config.onClose}
            className="px-4 py-2 rounded text-sm font-medium bg-dark-700 text-white hover:bg-dark-600 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export type ImportConfig = {
  isOpen: boolean;
  onClose: () => void;
  onImportFile: () => void;
  onImportFolder: () => void;
};

export const ImportDialog: React.FC<{ config: ImportConfig | null }> = ({ config }) => {
  if (!config?.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-dark-800 border border-dark-600 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UploadCloud size={20} className="text-accent-blue" />
            Import Files
          </h3>
          <button onClick={config.onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-400 mb-6 text-sm">
          Select what you would like to import into your workspace.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => {
              config.onImportFile();
              config.onClose();
            }}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-dark-600 rounded-lg hover:border-accent-neon hover:bg-dark-700/50 transition-colors group"
          >
            <div className="p-3 bg-dark-700 rounded-full mb-3 group-hover:bg-dark-600 transition-colors">
              <UploadCloud size={24} className="text-accent-neon" />
            </div>
            <span className="text-white font-medium">Import File(s)</span>
            <span className="text-xs text-gray-500 mt-1">Select one or more files</span>
          </button>
          
          <button
            onClick={() => {
              config.onImportFolder();
              config.onClose();
            }}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-dark-600 rounded-lg hover:border-accent-purple hover:bg-dark-700/50 transition-colors group"
          >
            <div className="p-3 bg-dark-700 rounded-full mb-3 group-hover:bg-dark-600 transition-colors">
              <UploadCloud size={24} className="text-accent-purple" />
            </div>
            <span className="text-white font-medium">Import Folder</span>
            <span className="text-xs text-gray-500 mt-1">Upload a whole directory</span>
          </button>
        </div>
      </div>
    </div>
  );
};
