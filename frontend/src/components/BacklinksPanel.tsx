import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAppStore } from '../stores/appStore';
import { Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BacklinksPanel: React.FC = () => {
  const { currentFilePath } = useAppStore();
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBacklinks = async () => {
      if (!currentFilePath) return;
      try {
        const links = await api.getBacklinks(currentFilePath);
        setBacklinks(links);
      } catch (e) {
        console.error("Failed to load backlinks", e);
      }
    };
    fetchBacklinks();
  }, [currentFilePath]);

  if (!currentFilePath || backlinks.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-dark-700">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
        <Link2 size={16} className="mr-2" />
        Linked Mentions
      </h3>
      <div className="space-y-2">
        {backlinks.map(link => (
          <div 
            key={`${link.source_path}-${link.line_number}`}
            onClick={() => navigate(`/${link.source_path.split('/').map(encodeURIComponent).join('/')}?line=${link.line_number}`)}
            className="p-3 bg-dark-800 rounded border border-dark-700 hover:border-accent-neon cursor-pointer transition-colors"
          >
            <div className="text-accent-neon text-sm font-medium mb-1">{link.source_path}</div>
            <div className="text-gray-400 text-xs truncate font-mono">
              {link.context}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
