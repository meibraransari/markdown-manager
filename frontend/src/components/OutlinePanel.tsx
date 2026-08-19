import React, { useMemo, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { ChevronRight, ChevronDown, List } from 'lucide-react';
import { clsx } from 'clsx';

interface OutlineItem {
  level: number;
  text: string;
  line: number;
}

export const OutlinePanel: React.FC = () => {
  const content = useAppStore(state => state.currentContent);
  const [isOpen, setIsOpen] = useState(true);

  const outline = useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    const items: OutlineItem[] = [];
    const regex = /^(#{1,6})\s+(.+)$/;
    
    lines.forEach((line, index) => {
      const match = line.match(regex);
      if (match) {
        items.push({
          level: match[1].length,
          text: match[2].trim(),
          line: index
        });
      }
    });
    return items;
  }, [content]);

  if (outline.length === 0) return null;

  const handleClick = (line: number) => {
    if ((window as any).scrollToEditorPercentage) {
      const totalLines = content.split('\n').length || 1;
      (window as any).scrollToEditorPercentage(line / totalLines);
    }
  };

  return (
    <div className="border-t border-dark-700 flex flex-col min-h-0 max-h-[40%]">
      <div 
        className="px-4 py-2 flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white hover:bg-dark-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown size={14} className="mr-1" /> : <ChevronRight size={14} className="mr-1" />}
        <List size={14} className="mr-2" />
        Outline
      </div>
      
      {isOpen && (
        <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-hide">
          {outline.map((item, i) => (
            <div
              key={i}
              className={clsx(
                "py-1 px-2 text-xs truncate cursor-pointer text-gray-400 hover:text-white hover:bg-dark-700 rounded transition-colors",
                item.level === 1 && "font-bold text-gray-300 mt-2",
                item.level === 2 && "font-semibold ml-2",
                item.level === 3 && "ml-4",
                item.level === 4 && "ml-6",
                item.level >= 5 && "ml-8"
              )}
              title={item.text}
              onClick={() => handleClick(item.line)}
            >
              {item.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
