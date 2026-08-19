import React from 'react';
import { useInstance } from '@milkdown/react';
import { commandsCtx } from '@milkdown/core';
import { 
  toggleStrongCommand, 
  toggleEmphasisCommand, 
  wrapInHeadingCommand, 
  wrapInBulletListCommand, 
  wrapInOrderedListCommand, 
  wrapInBlockquoteCommand, 
  toggleInlineCodeCommand,
  toggleLinkCommand,
  insertImageCommand
} from '@milkdown/preset-commonmark';
import { toggleStrikethroughCommand, insertTableCommand } from '@milkdown/preset-gfm';
import { 
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, Code, Table, Link, Image as ImageIcon
} from 'lucide-react';

export const EditorToolbar: React.FC = () => {
  const [loading, getEditor] = useInstance();

  const call = (command: any, payload?: any) => {
    if (loading) return;
    const editor = getEditor();
    editor.action((ctx) => {
      const commandManager = ctx.get(commandsCtx);
      commandManager.call(command.key, payload);
    });
  };

  if (loading) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 mb-4 p-2 bg-dark-800 rounded border border-dark-700 shadow-sm sticky top-0 z-10">
      <button onClick={() => call(toggleStrongCommand)} className="p-1.5 hover:bg-dark-600 rounded text-gray-400 hover:text-white" title="Bold"><Bold size={16} /></button>
      <button onClick={() => call(toggleEmphasisCommand)} className="p-1.5 hover:bg-dark-600 rounded text-gray-400 hover:text-white" title="Italic"><Italic size={16} /></button>
      <button onClick={() => call(toggleStrikethroughCommand)} className="p-1.5 hover:bg-dark-600 rounded text-gray-400 hover:text-white" title="Strikethrough"><Strikethrough size={16} /></button>
      
      <div className="w-px h-4 bg-dark-600 mx-1"></div>
      
      <button onClick={() => call(wrapInHeadingCommand, 1)} className="p-1.5 hover:bg-dark-600 rounded text-gray-400 hover:text-white" title="Heading 1"><Heading1 size={16} /></button>
      <button onClick={() => call(wrapInHeadingCommand, 2)} className="p-1.5 hover:bg-dark-600 rounded text-gray-400 hover:text-white" title="Heading 2"><Heading2 size={16} /></button>
      <button onClick={() => call(wrapInHeadingCommand, 3)} className="p-1.5 hover:bg-dark-600 rounded text-gray-400 hover:text-white" title="Heading 3"><Heading3 size={16} /></button>
      
      <div className="w-px h-4 bg-dark-600 mx-1"></div>
      
      <button onClick={() => call(wrapInBulletListCommand)} className="p-1.5 hover:bg-dark-600 rounded text-gray-400 hover:text-white" title="Bullet List"><List size={16} /></button>
      <button onClick={() => call(wrapInOrderedListCommand)} className="p-1.5 hover:bg-dark-600 rounded text-gray-400 hover:text-white" title="Ordered List"><ListOrdered size={16} /></button>
      <button onClick={() => call(wrapInBlockquoteCommand)} className="p-1.5 hover:bg-dark-600 rounded text-gray-400 hover:text-white" title="Blockquote"><Quote size={16} /></button>
      
      <div className="w-px h-4 bg-dark-600 mx-1"></div>
      
      <button onClick={() => call(toggleLinkCommand)} className="p-1.5 hover:bg-dark-600 rounded text-gray-400 hover:text-white" title="Link"><Link size={16} /></button>
      <button onClick={() => call(insertImageCommand)} className="p-1.5 hover:bg-dark-600 rounded text-gray-400 hover:text-white" title="Image"><ImageIcon size={16} /></button>
      <button onClick={() => call(toggleInlineCodeCommand)} className="p-1.5 hover:bg-dark-600 rounded text-gray-400 hover:text-white" title="Code"><Code size={16} /></button>
      <button onClick={() => call(insertTableCommand)} className="p-1.5 hover:bg-dark-600 rounded text-gray-400 hover:text-white" title="Table"><Table size={16} /></button>
    </div>
  );
};
