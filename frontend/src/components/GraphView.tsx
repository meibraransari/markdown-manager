import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { api } from '../api/client';
import { useAppStore } from '../stores/appStore';
import { useNavigate } from 'react-router-dom';

export const GraphView: React.FC = () => {
  const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const navigate = useNavigate();
  const theme = useAppStore(state => state.theme);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const data = await api.getGraph();
        setGraphData(data);
      } catch (e) {
        console.error("Failed to load graph", e);
      }
    };
    fetchGraph();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, [containerRef]);

  return (
    <div className="w-full h-full bg-dark-900" ref={containerRef}>
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={() => theme === 'theme-light' ? '#3b82f6' : '#58a6ff'}
        linkColor={() => theme === 'theme-light' ? '#cbd5e1' : '#30363d'}
        backgroundColor={theme === 'theme-light' ? '#ffffff' : '#0d1117'}
        onNodeClick={(node: any) => {
          const path = node.path || node.id;
          if (!path) return;
          navigate(`/${path.split('/').map(encodeURIComponent).join('/')}`);
          useAppStore.getState().setGraphOpen(false);
        }}
      />
    </div>
  );
};
