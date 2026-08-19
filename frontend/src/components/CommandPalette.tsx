import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { useNavigate } from 'react-router-dom';
import { File, Palette, Terminal, Search, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import type { FileNode } from '../api/client';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, fileTree, setTheme, toggleSidebar, toggleVimMode } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const getFlattenedFiles = (nodes: FileNode[]): string[] => {
    let result: string[] = [];
    for (const node of nodes) {
      if (node.type === 'file') result.push(node.path);
      if (node.children) result.push(...getFlattenedFiles(node.children));
    }
    return result;
  };

  const allFiles = getFlattenedFiles(fileTree);
  
  const commands = [
    { id: 'toggle-sidebar', label: 'Toggle Sidebar', icon: Settings, action: () => toggleSidebar() },
    { id: 'theme-dark', label: 'Theme: Dark', icon: Palette, action: () => setTheme('theme-dark') },
    { id: 'theme-obsidian', label: 'Theme: Obsidian', icon: Palette, action: () => setTheme('theme-obsidian') },
    { id: 'theme-dracula', label: 'Theme: Dracula', icon: Palette, action: () => setTheme('theme-dracula') },
    { id: 'toggle-vim', label: 'Toggle Vim Mode', icon: Terminal, action: () => toggleVimMode() },
  ];

  const q = query.toLowerCase();
  
  const filteredCommands = commands.filter(c => c.label.toLowerCase().includes(q));
  const filteredFiles = allFiles.filter(f => f.toLowerCase().includes(q));

  const items = [
    ...filteredCommands.map(c => ({ type: 'command' as const, ...c })),
    ...filteredFiles.map(f => ({ type: 'file' as const, label: f, icon: File, action: () => navigate(`/${f.split('/').map(encodeURIComponent).join('/')}`) }))
  ];

  const execute = (index: number) => {
    if (items[index]) {
      items[index].action();
      setCommandPaletteOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(s => Math.min(items.length - 1, s + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(s => Math.max(0, s - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execute(selectedIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-32" onClick={() => setCommandPaletteOpen(false)}>
      <div 
        className="bg-dark-800 border border-dark-700 rounded-lg w-full max-w-xl shadow-2xl overflow-hidden flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-dark-700">
          <Search size={18} className="text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-gray-500"
            placeholder="Type a command or search files..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8 text-sm">No results found.</div>
          ) : (
            items.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className={clsx(
                    "flex items-center px-4 py-2 cursor-pointer rounded text-sm transition-colors",
                    selectedIndex === i ? "bg-accent-neon text-black" : "text-gray-300 hover:bg-dark-700"
                  )}
                  onClick={() => execute(i)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <Icon size={16} className={clsx("mr-3", selectedIndex === i ? "text-black" : "text-gray-400")} />
                  <span className="truncate">{item.label}</span>
                  {item.type === 'command' && <span className={clsx("ml-auto text-xs font-mono", selectedIndex === i ? "text-black/70" : "text-gray-500")}>Command</span>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
