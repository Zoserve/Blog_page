import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Heading2, Heading3, Quote, Link as LinkIcon, Unlink } from 'lucide-react';

interface Props {
  editor: Editor;
}

export const SelectionBubbleMenu: React.FC<Props> = ({ editor }) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      if (!editor || editor.isDestroyed) {
        setShow(false);
        return;
      }
      const { selection } = editor.state;
      if (selection.empty) {
        setShow(false);
        return;
      }
      const { from, to } = selection;
      const startCoords = editor.view.coordsAtPos(from);
      const endCoords = editor.view.coordsAtPos(to);

      // Center the bubble menu horizontally over the text selection
      const left = (startCoords.left + endCoords.left) / 2;
      const top = Math.max(10, startCoords.top - 48); // 48px above text selection

      setCoords({ top, left });
      setShow(true);
    };

    editor.on('selectionUpdate', updatePosition);
    editor.on('transaction', updatePosition);

    const handleMouseUp = () => setTimeout(updatePosition, 10);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      editor.off('selectionUpdate', updatePosition);
      editor.off('transaction', updatePosition);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editor]);

  if (!show || !coords) return null;

  const handleLinkToggle = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = prompt('Enter URL:');
      if (url) editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        transform: 'translateX(-50%)',
        zIndex: 9999,
      }}
      className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-xl shadow-xl px-1.5 py-1 select-none"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive('bold')
            ? 'bg-[var(--color-primary-light)] text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive('italic')
            ? 'bg-[var(--color-primary-light)] text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      <span className="w-px h-4 bg-slate-200 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-[var(--color-primary-light)] text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-[var(--color-primary-light)] text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
        title="Heading 3"
      >
        <Heading3 className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive('blockquote')
            ? 'bg-[var(--color-primary-light)] text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
        title="Blockquote"
      >
        <Quote className="w-3.5 h-3.5" />
      </button>

      <span className="w-px h-4 bg-slate-200 mx-1" />

      <button
        type="button"
        onClick={handleLinkToggle}
        className={`p-1.5 rounded-lg transition-colors ${
          editor.isActive('link')
            ? 'bg-[var(--color-primary-light)] text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
        title={editor.isActive('link') ? 'Remove link' : 'Add link'}
      >
        {editor.isActive('link') ? (
          <Unlink className="w-3.5 h-3.5" />
        ) : (
          <LinkIcon className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
};
