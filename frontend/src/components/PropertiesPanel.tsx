import React, { useState, useEffect } from 'react';
import matter from 'gray-matter';
import { useAppStore } from '../stores/appStore';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';
export const PropertiesPanel: React.FC = () => {
  const { currentContent } = useAppStore();
  const [properties, setProperties] = useState<Record<string, any>>({});
  const [isOpen, setIsOpen] = useState(true);
  const [hasProperties, setHasProperties] = useState(false);

  useEffect(() => {
    try {
      const parsed = matter(currentContent);
      setHasProperties(Object.keys(parsed.data).length > 0);
      setProperties(parsed.data);
    } catch (e) {
      setHasProperties(false);
    }
  }, [currentContent]);

  if (!hasProperties) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-8 pt-6 pb-2">
      <div className="bg-dark-800 border border-dark-600 rounded-lg overflow-hidden">
        <div 
          className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-dark-700 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center text-gray-400 font-semibold text-xs uppercase tracking-wider">
            {isOpen ? <ChevronDown size={14} className="mr-1" /> : <ChevronRight size={14} className="mr-1" />}
            Properties
          </div>
          <Settings size={14} className="text-gray-500" />
        </div>
        
        {isOpen && (
          <div className="p-4 border-t border-dark-700 space-y-2 bg-dark-900/50">
            {Object.entries(properties).map(([key, value]) => (
              <div key={key} className="flex flex-wrap items-start">
                <span className="w-32 text-xs font-mono text-gray-500">{key}</span>
                <div className="flex-1 text-sm text-gray-300">
                  {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-1">
                      {value.map(v => (
                        <span key={v} className="bg-dark-700 px-2 py-0.5 rounded-full text-xs text-accent-neon">{v}</span>
                      ))}
                    </div>
                  ) : typeof value === 'object' ? (
                    <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
                  ) : (
                    <span>{String(value)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
