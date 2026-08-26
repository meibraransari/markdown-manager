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
import { Copy, Check } from 'lucide-react';

interface Props {
  content: string;
}

const CodeBlockWrapper: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  const [copied, setCopied] = React.useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = () => {
    if (preRef.current) {
      const text = preRef.current.innerText;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group my-4">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-dark-700/80 hover:bg-dark-600 text-gray-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-dark-500 shadow-sm"
        title="Copy Code"
      >
        {copied ? <Check size={14} className="text-accent-green" /> : <Copy size={14} />}
      </button>
      <pre ref={preRef} className={clsx(className, "m-0")}>
        {children}
      </pre>
    </div>
  );
};

const MermaidChart: React.FC<{ chart: string }> = ({ chart }) => {
  const [darkSvg, setDarkSvg] = React.useState<string>('');
  const [lightSvg, setLightSvg] = React.useState<string>('');

  useEffect(() => {
    const renderChart = async () => {
      try {
        // Dark theme for screen
        mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
        const id1 = 'mermaid-dark-' + Math.random().toString(36).substr(2, 9);
        const { svg: svgCodeDark } = await mermaid.render(id1, chart);
        setDarkSvg(svgCodeDark);

        // Light theme for print
        mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
        const id2 = 'mermaid-light-' + Math.random().toString(36).substr(2, 9);
        const { svg: svgCodeLight } = await mermaid.render(id2, chart);
        setLightSvg(svgCodeLight);
        
        // Restore dark for safety
        mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
      } catch (e) {
        console.error('Mermaid rendering failed', e);
        const errorHtml = `<div class="text-red-400 border border-red-500/20 p-4 rounded bg-red-500/10 text-sm font-mono whitespace-pre overflow-x-auto">${chart}</div>`;
        setDarkSvg(errorHtml);
        setLightSvg(errorHtml);
      }
    };
    renderChart();
  }, [chart]);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: darkSvg }} className="mermaid-dark flex justify-center py-4 w-full overflow-x-auto" />
      <div dangerouslySetInnerHTML={{ __html: lightSvg }} className="mermaid-light flex justify-center py-4 w-full overflow-visible [&>svg]:max-w-full [&>svg]:h-auto" />
    </>
  );
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
          pre: ({ node, children, ...props }: any) => {
            const childNode = node?.children?.[0];
            const className = childNode?.properties?.className || [];
            const langClass = Array.isArray(className) 
              ? className.find((c: string) => c.startsWith('language-')) || ''
              : String(className).startsWith('language-') ? String(className) : '';
            const lang = langClass.replace('language-', '').toLowerCase();
            
            const isMermaidLang = ['mermaid', 'marmarid', 'mermaidjs'].includes(lang);
            
            // Extract raw text to check for implicit mermaid
            let rawText = '';
            if (childNode?.children) {
              const getText = (n: any): string => {
                if (n.type === 'text') return n.value;
                if (n.children) return n.children.map(getText).join('');
                return '';
              };
              rawText = childNode.children.map(getText).join('');
            }
            
            const isMermaidContent = /^(graph\s|flowchart\s|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|gitGraph|mindmap|timeline)\b/i.test(rawText.trim());
            const isProgrammingLang = ['javascript', 'js', 'typescript', 'ts', 'python', 'py', 'java', 'c', 'cpp', 'go', 'rust', 'bash', 'sh', 'json', 'yaml', 'yml', 'html', 'css', 'sql'].includes(lang);
            
            const isMermaid = isMermaidLang || (isMermaidContent && !isProgrammingLang);
              
            // If it's a mermaid block, just return children (which will be the MermaidChart component)
            // wrapped in a simple div to avoid <pre> styling issues.
            if (isMermaid) {
              return <div className="mermaid-wrapper my-4">{children}</div>;
            }
            
            return <CodeBlockWrapper {...props}>{children}</CodeBlockWrapper>;
          },
          img: ({ src, alt, title, ...props }) => {
            if (!src) return <img alt={alt} title={title} {...props} />;
            let finalSrc = src;
            if (!src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('/')) {
              const currentFilePath = useAppStore.getState().currentFilePath;
              const basePath = currentFilePath ? currentFilePath.split('/').slice(0, -1).join('/') : '';
              const fakeBase = new URL(`http://localhost/raw/${basePath}${basePath ? '/' : ''}`);
              const resolvedUrl = new URL(src, fakeBase);
              finalSrc = resolvedUrl.pathname + resolvedUrl.search + resolvedUrl.hash;
            }
            return <img src={finalSrc} alt={alt} title={title} className="max-w-full h-auto rounded shadow-sm" {...props} />;
          },
          a: ({ node, href, children, ...props }) => {
            return (
              <a 
                href={href} 
                className="text-accent-blue hover:underline cursor-pointer"
                onClick={(e) => {
                  if (!href) return;
                  if (href.startsWith('#')) return;
                  
                  try {
                    const url = new URL(href, window.location.href);
                    if (url.origin === window.location.origin) {
                      e.preventDefault();
                      const decodedPath = decodeURIComponent(url.pathname);
                      const encodedPath = decodedPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
                      navigate(encodedPath + url.search + url.hash);
                    }
                  } catch(err) {
                    // Fallback to default
                  }
                }}
                target={href && href.startsWith('http') && !href.startsWith(window.location.origin) ? "_blank" : undefined}
                rel={href && href.startsWith('http') && !href.startsWith(window.location.origin) ? "noopener noreferrer" : undefined}
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
