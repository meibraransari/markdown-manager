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
import { clsx } from 'clsx';

interface Props {
  content: string;
}

const MermaidChart: React.FC<{ chart: string }> = ({ chart }) => {
  const [svg, setSvg] = React.useState<string>('');

  useEffect(() => {
    const renderChart = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
        });
        const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
        const { svg: svgCode } = await mermaid.render(id, chart);
        setSvg(svgCode);
      } catch (e) {
        console.error('Mermaid rendering failed', e);
        setSvg(`<div class="text-red-400 border border-red-500/20 p-4 rounded bg-red-500/10 text-sm font-mono whitespace-pre overflow-x-auto">${chart}</div>`);
      }
    };
    renderChart();
  }, [chart]);

  return <div dangerouslySetInnerHTML={{ __html: svg }} className="flex justify-center py-4 w-full overflow-x-auto" />;
};

export const MarkdownReader: React.FC<Props> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomLevel = useAppStore(state => state.zoomLevel);
  const isPageView = useAppStore(state => state.isPageView);
  const pageWidth = useAppStore(state => state.pageWidth);
  const navigate = useNavigate();

  // Transform [[Page Name]] into [Page Name](Page Name.md)
  const processedContent = content.replace(/\[\[(.*?)\]\]/g, '[$1]($1.md)');

  return (
    <div className={clsx(
      "flex flex-col min-h-full transition-colors duration-200",
      isPageView ? "bg-dark-900 py-8 px-4" : ""
    )}>
      <div 
        className={clsx(
          "transition-all duration-200 w-full mx-auto",
          isPageView ? "bg-dark-800 shadow-2xl rounded-sm border border-dark-700 min-h-[1056px]" : "max-w-4xl"
        )}
        style={{
          maxWidth: isPageView ? `${pageWidth}px` : undefined,
        }}
      >
        <PropertiesPanel />
        <div 
          ref={containerRef} 
          className={clsx(
            "mx-auto w-full prose transition-all duration-200",
            isPageView ? "px-16 py-16" : "px-8 pb-8 pt-4"
          )}
          style={{ fontSize: `${zoomLevel}%` }}
        >
          <ReactMarkdown
          remarkPlugins={[remarkFrontmatter, remarkGfm, remarkMath]}
          rehypePlugins={[rehypeSanitize, [rehypeHighlight, { ignoreMissing: true }], rehypeKatex]}
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
            const lang = match ? match[1].toLowerCase() : '';
            const chartText = String(children).replace(/\n$/, '');
            
            const isMermaidLang = ['mermaid', 'marmarid', 'mermaidjs'].includes(lang);
            const isMermaidContent = /^(graph\s|flowchart\s|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|gitGraph|mindmap|timeline)\b/i.test(chartText.trim());
            const isProgrammingLang = ['javascript', 'js', 'typescript', 'ts', 'python', 'py', 'java', 'c', 'cpp', 'go', 'rust', 'bash', 'sh', 'json', 'yaml', 'yml', 'html', 'css', 'sql'].includes(lang);
            
            if (!inline && (isMermaidLang || (isMermaidContent && !isProgrammingLang))) {
              return <MermaidChart chart={chartText} />;
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
      </div>
      <BacklinksPanel />
    </div>
  );
};
