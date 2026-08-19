import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import Editor from '@monaco-editor/react';
import { 
  Bold, Italic, Strikethrough, 
  Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  List, ListOrdered, CheckSquare, 
  Link, Image as ImageIcon, Code, Table, Quote, Terminal
} from 'lucide-react';

export const MarkdownEditor: React.FC = () => {
  const content = useAppStore(state => state.currentContent);
  const updateContent = useAppStore(state => state.updateContent);
  const zoomLevel = useAppStore(state => state.zoomLevel);
  const isDarkMode = useAppStore(state => state.isDarkMode);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    (window as any).scrollToEditorPercentage = (percentage: number) => {
      if (!editorRef.current) return;
      const editor = editorRef.current;
      const scrollHeight = editor.getScrollHeight();
      const height = editor.getLayoutInfo().height;
      editor.setScrollTop(percentage * (scrollHeight - height));
    };
    return () => {
      delete (window as any).scrollToEditorPercentage;
    };
  }, []);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    editor.onDidScrollChange((e: any) => {
      const sync = useAppStore.getState().syncScroll;
      if (!sync) return;
      if ((window as any).isScrollingEditor) return;

      const previewPane = document.getElementById('preview-pane');
      if (previewPane) {
        (window as any).isScrollingPreview = true;
        
        const scrollHeight = editor.getScrollHeight();
        const height = editor.getLayoutInfo().height;
        const percentage = e.scrollTop / (scrollHeight - height);
        
        const previewScrollHeight = previewPane.scrollHeight;
        const previewClientHeight = previewPane.clientHeight;
        previewPane.scrollTop = percentage * (previewScrollHeight - previewClientHeight);
        
        setTimeout(() => { (window as any).isScrollingPreview = false; }, 50);
      }
    });
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    const model = editor.getModel();
    if (!selection || !model) return;

    const selectedText = model.getValueInRange(selection);
    const newText = `${prefix}${selectedText}${suffix}`;

    editor.executeEdits('toolbar', [
      {
        range: selection,
        text: newText,
        forceMoveMarkers: true,
      }
    ]);

    editor.focus();
    if (selectedText.length === 0) {
      const position = editor.getPosition();
      editor.setPosition({
        lineNumber: position.lineNumber,
        column: position.column - suffix.length,
      });
    }
  };

  const insertLinePrefix = (prefix: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    const model = editor.getModel();
    if (!selection || !model) return;

    const startLineNumber = selection.startLineNumber;
    const endLineNumber = selection.endLineNumber;

    const edits = [];
    for (let i = startLineNumber; i <= endLineNumber; i++) {
      edits.push({
        range: new (window as any).monaco.Range(i, 1, i, 1),
        text: prefix,
        forceMoveMarkers: true,
      });
    }

    editor.executeEdits('toolbar', edits);
    editor.focus();
  };

  const ToolbarButton = ({ icon: Icon, onClick, title }: { icon: any, onClick: () => void, title: string }) => (
    <button
      onClick={onClick}
      className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-dark-700 rounded transition-colors"
      title={title}
    >
      <Icon size={16} />
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-dark-700 mx-1"></div>;

  return (
    <div className="w-full h-full bg-dark-900 flex flex-col">
      <div className="flex flex-wrap items-center px-2 py-1 bg-dark-800 border-b border-dark-700 select-none">
        <ToolbarButton icon={Bold} onClick={() => insertFormatting('**', '**')} title="Bold" />
        <ToolbarButton icon={Italic} onClick={() => insertFormatting('_', '_')} title="Italic" />
        <ToolbarButton icon={Strikethrough} onClick={() => insertFormatting('~~', '~~')} title="Strikethrough" />
        <Divider />
        <ToolbarButton icon={Heading1} onClick={() => insertLinePrefix('# ')} title="Heading 1" />
        <ToolbarButton icon={Heading2} onClick={() => insertLinePrefix('## ')} title="Heading 2" />
        <ToolbarButton icon={Heading3} onClick={() => insertLinePrefix('### ')} title="Heading 3" />
        <ToolbarButton icon={Heading4} onClick={() => insertLinePrefix('#### ')} title="Heading 4" />
        <ToolbarButton icon={Heading5} onClick={() => insertLinePrefix('##### ')} title="Heading 5" />
        <ToolbarButton icon={Heading6} onClick={() => insertLinePrefix('###### ')} title="Heading 6" />
        <Divider />
        <ToolbarButton icon={List} onClick={() => insertLinePrefix('- ')} title="Unordered List" />
        <ToolbarButton icon={ListOrdered} onClick={() => insertLinePrefix('1. ')} title="Ordered List" />
        <ToolbarButton icon={CheckSquare} onClick={() => insertLinePrefix('- [ ] ')} title="Task List" />
        <Divider />
        <ToolbarButton icon={Quote} onClick={() => insertLinePrefix('> ')} title="Blockquote" />
        <ToolbarButton 
          icon={ListOrdered} 
          onClick={() => {
            const toc = ['## Table of Contents', ''];
            const lines = content.split('\n');
            lines.forEach(line => {
              const match = line.match(/^(#{1,6})\s+(.+)$/);
              if (match) {
                const level = match[1].length;
                const title = match[2];
                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const indent = '  '.repeat(level - 1);
                toc.push(`${indent}- [${title}](#${slug})`);
              }
            });
            insertFormatting(toc.join('\n') + '\n\n');
          }} 
          title="Table of Contents" 
        />
        <Divider />
        <ToolbarButton icon={Link} onClick={() => insertFormatting('[', '](url)')} title="Link" />
        <ToolbarButton icon={ImageIcon} onClick={() => insertFormatting('![', '](image-url)')} title="Image" />
        <ToolbarButton icon={Code} onClick={() => insertFormatting('`', '`')} title="Inline Code" />
        <ToolbarButton icon={Terminal} onClick={() => insertFormatting('\n```\n', '\n```\n')} title="Code Block" />
        <ToolbarButton 
          icon={Table} 
          onClick={() => insertFormatting('\n| Column 1 | Column 2 |\n| -------- | -------- |\n| Text     | Text     |\n')} 
          title="Table" 
        />
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="markdown"
          theme={isDarkMode ? 'vs-dark' : 'light'}
          value={content}
          onChange={(val) => updateContent(val || '')}
          onMount={handleEditorDidMount}
          options={{
            wordWrap: 'on',
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
            fontSize: Math.round(15 * (zoomLevel / 100)),
          }}
        />
      </div>
    </div>
  );
};
