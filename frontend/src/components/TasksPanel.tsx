import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { TaskItem } from '../api/client';
import { CheckSquare, Circle, CheckCircle2, ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

export const TasksPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data);
      
      // Auto-expand all files by default
      const files = [...new Set(data.map(t => t.path))];
      const expandState: Record<string, boolean> = {};
      files.forEach(f => expandState[f] = true);
      setExpandedFiles(expandState);
    } catch (e) {
      console.error("Failed to load tasks", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const toggleFile = (path: string) => {
    setExpandedFiles(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleToggleTask = async (task: TaskItem) => {
    // Optimistic update
    setTasks(prev => prev.map(t => 
      (t.path === task.path && t.line_number === task.line_number) 
        ? { ...t, completed: !t.completed } 
        : t
    ));
    
    try {
      await api.toggleTask(task.path, task.line_number, !task.completed);
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

  const navigateToTask = (path: string, line: number) => {
    navigate(`/${path.split('/').map(encodeURIComponent).join('/')}?line=${line}`);
  };

  // Group tasks by file
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.path]) acc[task.path] = [];
    acc[task.path].push(task);
    return acc;
  }, {} as Record<string, TaskItem[]>);

  return (
    <div className="flex flex-col border-t border-dark-700">
      <div 
        className="flex items-center px-4 py-3 cursor-pointer hover:bg-dark-700/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown size={14} className="text-gray-400" />
        ) : (
          <ChevronRight size={14} className="text-gray-400" />
        )}
        <span className="ml-2 text-xs font-semibold text-gray-300 uppercase tracking-wider flex-1">Tasks</span>
        {isOpen && (
          <button 
            onClick={(e) => { e.stopPropagation(); loadTasks(); }} 
            className="text-xs text-accent-blue hover:text-white transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      {isOpen && (
        <div className="flex-1 overflow-y-auto max-h-64 px-2 pb-2">
          {loading && tasks.length === 0 ? (
            <div className="flex items-center justify-center text-gray-500 text-sm p-4">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-500 text-sm p-4 text-center">
              <CheckSquare size={24} className="mb-2 opacity-20" />
              <p className="text-xs">No tasks found.</p>
            </div>
          ) : (
            <div>
              {Object.entries(groupedTasks).map(([path, fileTasks]) => {
        const isExpanded = expandedFiles[path];
        const completedCount = fileTasks.filter(t => t.completed).length;
        const totalCount = fileTasks.length;
        
        return (
          <div key={path} className="mb-2">
            <div 
              className="flex items-center text-sm text-gray-300 hover:text-white hover:bg-dark-700/50 p-1 rounded cursor-pointer transition-colors"
              onClick={() => toggleFile(path)}
            >
              {isExpanded ? <ChevronDown size={14} className="mr-1 opacity-70" /> : <ChevronRight size={14} className="mr-1 opacity-70" />}
              <FileText size={14} className="mr-1.5 opacity-70" />
              <span className="truncate flex-1">{path.split('/').pop()}</span>
              <span className="text-xs opacity-50 ml-2">{completedCount}/{totalCount}</span>
            </div>
            
            {isExpanded && (
              <div className="mt-1 ml-4 space-y-1">
                {fileTasks.map(task => (
                  <div 
                    key={`${task.path}-${task.line_number}`}
                    className="flex items-start text-sm group p-1 rounded hover:bg-dark-700/30 transition-colors"
                  >
                    <button 
                      onClick={() => handleToggleTask(task)}
                      className="mt-0.5 mr-2 text-gray-500 hover:text-accent-blue transition-colors flex-shrink-0"
                    >
                      {task.completed ? <CheckCircle2 size={14} className="text-accent-blue" /> : <Circle size={14} />}
                    </button>
                    <span 
                      className={clsx(
                        "cursor-pointer break-words flex-1",
                        task.completed ? "text-gray-500 line-through" : "text-gray-300 hover:text-white"
                      )}
                      onClick={() => navigateToTask(task.path, task.line_number)}
                    >
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
