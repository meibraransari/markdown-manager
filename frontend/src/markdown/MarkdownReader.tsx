import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import mermaid from 'mermaid';
import 'highlight.js/styles/github-dark.css'; // Let's use a dark highlight theme
import { useAppStore } from '../stores/appStore';

interface Props {
  content: string;
}

export const MarkdownReader: React.FC<Props> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomLevel = useAppStore(state => state.zoomLevel);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
    });
    if (containerRef.current) {
      mermaid.run({
        nodes: containerRef.current.querySelectorAll('.language-mermaid'),
      }).catch(e => console.error("Mermaid render error", e));
    }
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className="max-w-4xl mx-auto p-8 w-full prose transition-all duration-200"
      style={{ fontSize: `${zoomLevel}%` }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSanitize]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const isMermaid = match && match[1] === 'mermaid';
            if (!inline && isMermaid) {
              return (
                <div className="mermaid language-mermaid flex justify-center py-4">
                  {String(children).replace(/\n$/, '')}
                </div>
              );
            }
            return !inline ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
