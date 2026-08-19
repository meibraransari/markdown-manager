import React, { useEffect, useState } from 'react';
import { Tag, ChevronRight, ChevronDown } from 'lucide-react';
import { api } from '../api/client';
import { useAppStore } from '../stores/appStore';

export const TagsPanel: React.FC = () => {
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [isOpen, setIsOpen] = useState(true);
  const { currentFilePath } = useAppStore();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await api.getTags();
        setTags(data);
      } catch (e) {
        console.error("Failed to load tags", e);
      }
    };
    fetchTags();
  }, [currentFilePath]); // Refetch when files change

  const tagList = Object.entries(tags).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="flex flex-col border-t border-dark-700 bg-dark-800">
      <div 
        className="flex items-center px-4 py-2 cursor-pointer hover:bg-dark-700 transition-colors select-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-200" />
        ) : (
          <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-200" />
        )}
        <span className="ml-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">Tags</span>
      </div>
      
      {isOpen && (
        <div className="flex-1 overflow-y-auto max-h-64 px-2 pb-2">
          {tagList.length === 0 ? (
            <div className="px-6 py-2 text-xs text-gray-500 italic">No tags found</div>
          ) : (
            <div className="flex flex-wrap gap-1 p-2">
              {tagList.map(([tag, files]) => (
                <div 
                  key={tag}
                  onClick={() => {
                    // Open global search with this tag
                    const store = useAppStore.getState();
                    store.setSearchOpen(true);
                    // We don't have a direct way to set the search query in Sidebar from here 
                    // unless we add it to the store. 
                    // Let's add searchQuery to store!
                    store.setSearchQuery('#' + tag);
                  }}
                  className="px-2 py-1 bg-dark-700 hover:bg-dark-600 rounded text-xs text-accent-neon cursor-pointer transition-colors flex items-center"
                  title={`${files.length} files`}
                >
                  <Tag size={10} className="mr-1" />
                  {tag} <span className="text-gray-500 ml-1">({files.length})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
