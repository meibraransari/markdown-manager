import React, { useEffect, useState } from 'react';
import { GitBranch, RefreshCw, Check } from 'lucide-react';
import { api } from '../api/client';
import { useAppStore } from '../stores/appStore';

export const GitPanel: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [log, setLog] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { currentFilePath } = useAppStore(); // To trigger re-fetches occasionally

  const fetchData = async () => {
    try {
      setStatus(await api.getGitStatus());
      setLog(await api.getGitLog());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentFilePath, isOpen]);

  const handleCommit = async () => {
    if (!message) return;
    setIsCommitting(true);
    try {
      await api.gitCommit(message);
      setMessage('');
      fetchData();
    } catch (e) {
      alert("Commit failed");
    } finally {
      setIsCommitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-dark-800 border border-dark-600 p-3 rounded-full text-gray-400 hover:text-accent-neon hover:border-accent-neon shadow-lg transition-all z-40"
        title="Git Version Control"
      >
        <GitBranch size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between p-3 bg-dark-900 border-b border-dark-700">
        <div className="flex items-center font-semibold text-gray-200">
          <GitBranch size={16} className="mr-2 text-accent-purple" />
          Version Control
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
          &times;
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto max-h-96">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Uncommitted Changes</h4>
        {status ? (
          <pre className="text-xs text-accent-pink bg-dark-900 p-2 rounded overflow-x-auto mb-4">{status}</pre>
        ) : (
          <div className="text-xs text-gray-500 italic mb-4 flex items-center">
            <Check size={12} className="mr-1" /> Working tree clean
          </div>
        )}

        <div className="flex flex-col gap-2 mb-6">
          <input 
            type="text" 
            placeholder="Commit message..." 
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full bg-dark-900 border border-dark-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent-neon"
          />
          <button 
            onClick={handleCommit}
            disabled={!message || isCommitting || !status}
            className="w-full bg-accent-purple hover:bg-accent-purple/80 disabled:opacity-50 text-white rounded py-1.5 text-sm font-medium transition-colors flex items-center justify-center"
          >
            {isCommitting ? <RefreshCw size={14} className="animate-spin" /> : 'Commit Changes'}
          </button>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent History</h4>
        <div className="space-y-2">
          {log.map(commit => (
            <div key={commit.hash} className="flex flex-col bg-dark-900 p-2 rounded text-xs border border-dark-700">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-accent-neon">{commit.hash}</span>
                <span className="text-gray-500">{commit.time}</span>
              </div>
              <span className="text-gray-300">{commit.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
