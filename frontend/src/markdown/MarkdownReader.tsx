import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';
import remarkFrontmatter from 'remark-frontmatter';
import { useAppStore } from '../stores/appStore';
import { useNavigate } from 'react-router-dom';
import { BacklinksPanel } from '../components/BacklinksPanel';
import { PropertiesPanel } from '../components/PropertiesPanel';

interface Props {
  content: string;
}

export const MarkdownReader: React.FC<Props> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomLevel = useAppStore(state => state.zoomLevel);
  const navigate = useNavigate();

  // Transform [[Page Name]] into [Page Name](Page Name.md)
  const processedContent = content.replace(/\[\[(.*?)\]\]/g, '[$1]($1.md)');

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
    <div className="flex flex-col h-full overflow-y-auto">
      <PropertiesPanel />
      <div 
        ref={containerRef} 
        className="max-w-4xl mx-auto px-8 pb-8 pt-4 w-full prose transition-all duration-200"
        style={{ fontSize: `${zoomLevel}%` }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkFrontmatter, remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeSanitize, rehypeKatex]}
        components={{
          a: ({ node, href, children, ...props }) => {
            return (
              <a 
                href={href} 
                onClick={(e) => {
                  if (href && !href.startsWith('http') && !href.startsWith('#')) {
                    e.preventDefault();
                    navigate(`/${href.split('/').map(encodeURIComponent).join('/')}`);
                  }
                }}
                {...props}
              >
                {children}
              </a>
            );
          },
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
        {processedContent}
      </ReactMarkdown>
      </div>
      <BacklinksPanel />
    </div>
  );
};
