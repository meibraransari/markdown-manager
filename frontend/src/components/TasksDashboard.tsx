import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { TaskItem } from '../api/client';
import { X, CheckSquare, Square, File as FileIcon, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

export const TasksDashboard: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [draggedTask, setDraggedTask] = useState<TaskItem | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getTasks()
        .then(setTasks)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const handleToggle = async (task: TaskItem, newCompletedState: boolean) => {
    if (task.completed === newCompletedState) return;

    // Optimistic update
    setTasks(prev => prev.map(t => 
      (t.path === task.path && t.line_number === task.line_number) 
        ? { ...t, completed: newCompletedState } 
        : t
    ));

    try {
      await api.toggleTask(task.path, task.line_number, newCompletedState);
    } catch (e) {
      console.error("Failed to toggle task", e);
      // Revert on failure
      setTasks(prev => prev.map(t => 
        (t.path === task.path && t.line_number === task.line_number) 
          ? { ...t, completed: task.completed } 
          : t
      ));
    }
  };

  const handleDrop = (e: React.DragEvent, targetCompleted: boolean) => {
    e.preventDefault();
    if (draggedTask) {
      handleToggle(draggedTask, targetCompleted);
      setDraggedTask(null);
    }
  };

  const renderTaskCard = (t: TaskItem, isCompleted: boolean) => (
    <div 
      key={`${t.path}-${t.line_number}`} 
      draggable
      onDragStart={() => setDraggedTask(t)}
      onDragEnd={() => setDraggedTask(null)}
      className={clsx(
        "group relative p-4 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing",
        "hover:shadow-lg hover:-translate-y-0.5",
        isCompleted 
          ? "bg-dark-800/80 border-dark-700/50 hover:border-dark-600" 
          : "bg-dark-800 border-dark-600 hover:border-accent-neon/50 shadow-md"
      )}
    >
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 transition-opacity">
        <GripVertical size={16} />
      </div>
      <div className="pl-4">
        <p className={clsx(
          "text-sm font-medium leading-snug",
          isCompleted ? "text-gray-500 line-through" : "text-gray-200"
        )}>
          {t.text}
        </p>
        <div 
          className="mt-3 flex items-center text-[11px] font-medium tracking-wide uppercase text-gray-500 hover:text-accent-neon transition-colors w-fit"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            navigate(`/${t.path.split('/').map(encodeURIComponent).join('/')}?line=${t.line_number}`);
          }}
        >
          <FileIcon size={12} className="mr-1.5 opacity-70" />
          <span className="truncate max-w-[200px]">{t.path.split('/').pop()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div 
        className="bg-dark-900 border border-dark-700/50 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-800 bg-dark-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-neon/10 rounded-lg">
              <CheckSquare className="text-accent-neon" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Task Dashboard</h2>
            {loading && <span className="ml-3 text-xs text-gray-500 animate-pulse">Syncing...</span>}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Board */}
        <div className="flex-1 flex gap-6 p-6 overflow-hidden bg-dark-950/30">
          
          {/* TODO Column */}
          <div 
            className="flex-1 flex flex-col bg-dark-900/50 rounded-2xl border border-dark-800 overflow-hidden"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, false)}
          >
            <div className="px-5 py-4 border-b border-dark-800/50 flex items-center justify-between bg-dark-900/80">
              <h3 className="text-sm font-bold text-accent-neon uppercase tracking-wider flex items-center gap-2">
                <Square size={16} /> 
                To Do
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-accent-neon/10 text-accent-neon text-xs font-semibold">
                {incompleteTasks.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {incompleteTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                  <CheckSquare size={32} className="mb-3" />
                  <p className="text-sm font-medium">All caught up!</p>
                </div>
              ) : (
                incompleteTasks.map(t => renderTaskCard(t, false))
              )}
            </div>
          </div>
          
          {/* DONE Column */}
          <div 
            className="flex-1 flex flex-col bg-dark-900/30 rounded-2xl border border-dark-800/50 overflow-hidden opacity-90 transition-opacity hover:opacity-100"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, true)}
          >
            <div className="px-5 py-4 border-b border-dark-800/50 flex items-center justify-between bg-dark-900/50">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <CheckSquare size={16} /> 
                Done
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-dark-800 text-gray-400 text-xs font-semibold border border-dark-700">
                {completedTasks.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {completedTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                  <CheckSquare size={32} className="mb-3" />
                  <p className="text-sm font-medium">No completed tasks</p>
                </div>
              ) : (
                completedTasks.map(t => renderTaskCard(t, true))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
