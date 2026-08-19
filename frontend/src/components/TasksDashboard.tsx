import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { X, CheckSquare, Square, File as FileIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const TasksDashboard: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      api.getTasks().then(setTasks).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-lg w-full max-w-4xl shadow-2xl flex flex-col h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <div className="flex items-center text-lg font-semibold text-gray-200">
            <CheckSquare className="mr-2 text-accent-green" size={24} />
            Task Dashboard
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 flex gap-6">
          <div className="flex-1 bg-dark-900/50 p-4 rounded border border-dark-700">
            <h3 className="text-sm font-semibold text-accent-neon uppercase tracking-wider mb-4 flex items-center">
              <Square size={16} className="mr-2" /> To Do ({incompleteTasks.length})
            </h3>
            <div className="space-y-2">
              {incompleteTasks.map((t, i) => (
                <div key={i} className="p-3 bg-dark-800 rounded border border-dark-600">
                  <p className="text-sm text-gray-200">{t.text}</p>
                  <div 
                    className="mt-2 flex items-center text-xs text-gray-500 hover:text-accent-neon cursor-pointer"
                    onClick={() => {
                      onClose();
                      navigate(`/${t.file.split('/').map(encodeURIComponent).join('/')}`);
                    }}
                  >
                    <FileIcon size={12} className="mr-1" />
                    {t.file}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 bg-dark-900/50 p-4 rounded border border-dark-700 opacity-80">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
              <CheckSquare size={16} className="mr-2" /> Done ({completedTasks.length})
            </h3>
            <div className="space-y-2">
              {completedTasks.map((t, i) => (
                <div key={i} className="p-3 bg-dark-800 rounded border border-dark-700">
                  <p className="text-sm text-gray-500 line-through">{t.text}</p>
                  <div 
                    className="mt-2 flex items-center text-xs text-gray-600 hover:text-accent-neon cursor-pointer"
                    onClick={() => {
                      onClose();
                      navigate(`/${t.file.split('/').map(encodeURIComponent).join('/')}`);
                    }}
                  >
                    <FileIcon size={12} className="mr-1" />
                    {t.file}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
