import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import {
  Plus,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  Image as ImageIcon,
  Video,
  Table,
  Code2,
  Quote,
  List,
  ListOrdered,
} from 'lucide-react';
import api from '../../services/api';
import imageCompression from 'browser-image-compression';

interface BlockOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  action: (editor: Editor, extras?: any) => void;
}

interface Props {
  editor: Editor;
  onInsertError: (msg: string) => void;
}

const MAX_IMAGE_MB = 10;

const FloatingBlockMenu: React.FC<Props> = ({ editor, onInsertError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [show, setShow] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Position tracking for empty lines
  useEffect(() => {
    const updatePosition = () => {
      if (!editor || editor.isDestroyed) {
        setShow(false);
        return;
      }
      const { selection } = editor.state;
      const { $anchor, empty } = selection;

      // Only show on empty paragraphs at the top level
      const isEmptyParagraph =
        empty &&
        $anchor.parent.type.name === 'paragraph' &&
        $anchor.parent.childCount === 0;

      if (!isEmptyParagraph) {
        setShow(false);
        return;
      }

      const { from } = selection;
      const startCoords = editor.view.coordsAtPos(from);

      // Position the "+" button to the left of the line
      const left = Math.max(10, startCoords.left - 36);
      const top = startCoords.top - 2;

      setCoords({ top, left });
      setShow(true);
    };

    editor.on('selectionUpdate', updatePosition);
    editor.on('transaction', updatePosition);

    return () => {
      editor.off('selectionUpdate', updatePosition);
      editor.off('transaction', updatePosition);
    };
  }, [editor]);

  // Close when clicking outside the popover
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const uploadAndInsertImage = useCallback(
    async (file: File) => {
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        onInsertError(`Image must be under ${MAX_IMAGE_MB}MB`);
        return;
      }

      setUploading(true);

      const placeholderId = `img-loading-${Date.now()}`;
      editor
        .chain()
        .focus()
        .insertContent(
          `<p id="${placeholderId}" style="color:#94a3b8;font-style:italic;font-size:13px;">⏳ Uploading image...</p>`
        )
        .run();

      try {
        let fileToUpload = file;
        if (file.size > 2 * 1024 * 1024) {
          fileToUpload = await imageCompression(file, {
            maxSizeMB: 2,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
        }

        const formData = new FormData();
        formData.append('file', fileToUpload);
        const res = await api.post('/admin/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const imageUrl: string = res.data.url || `/api/v1/public/images/${res.data.id}`;

        const { state, view } = editor;
        let placeholderPos: number | null = null;
        state.doc.descendants((node, pos) => {
          if (node.type.name === 'paragraph') {
            const firstChild = node.firstChild;
            if (firstChild?.type.name === 'text' && firstChild.text?.includes(placeholderId)) {
              placeholderPos = pos;
            }
          }
        });

        if (placeholderPos !== null) {
          const tr = state.tr.replaceWith(
            placeholderPos,
            placeholderPos + state.doc.nodeAt(placeholderPos)!.nodeSize,
            state.schema.nodes.image.create({ src: imageUrl, alt: file.name })
          );
          view.dispatch(tr);
        } else {
          editor.chain().focus().setImage({ src: imageUrl, alt: file.name }).run();
        }
      } catch (err) {
        console.error('Image upload failed', err);
        onInsertError('Image upload failed. Please try again.');
        editor.chain().undo().run();
      } finally {
        setUploading(false);
      }
    },
    [editor, onInsertError]
  );

  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = '';
      await uploadAndInsertImage(file);
    },
    [uploadAndInsertImage]
  );

  const handleVideoInsert = useCallback(() => {
    const url = prompt('Enter YouTube URL (e.g. https://www.youtube.com/watch?v=abc123)');
    if (!url) return;
    editor.chain().focus().setYoutubeVideo({ src: url }).run();
    setIsOpen(false);
  }, [editor]);

  const blockOptions: BlockOption[] = [
    {
      id: 'h1',
      label: 'Heading 1',
      icon: <Heading1 className="w-4 h-4" />,
      description: 'Large section header',
      action: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      id: 'h2',
      label: 'Heading 2',
      icon: <Heading2 className="w-4 h-4" />,
      description: 'Medium section header',
      action: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      id: 'h3',
      label: 'Heading 3',
      icon: <Heading3 className="w-4 h-4" />,
      description: 'Small section header',
      action: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      id: 'paragraph',
      label: 'Paragraph',
      icon: <AlignLeft className="w-4 h-4" />,
      description: 'Normal text block',
      action: (ed) => ed.chain().focus().setParagraph().run(),
    },
    {
      id: 'image',
      label: 'Image',
      icon: <ImageIcon className="w-4 h-4" />,
      description: 'Upload or embed image',
      action: () => {
        setIsOpen(false);
        setTimeout(() => fileInputRef.current?.click(), 50);
      },
    },
    {
      id: 'video',
      label: 'Video',
      icon: <Video className="w-4 h-4" />,
      description: 'Embed YouTube video',
      action: () => handleVideoInsert(),
    },
    {
      id: 'table',
      label: 'Table',
      icon: <Table className="w-4 h-4" />,
      description: 'Insert a 2x2 table',
      action: (ed) =>
        ed
          .chain()
          .focus()
          .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
          .run(),
    },
    {
      id: 'codeBlock',
      label: 'Code Block',
      icon: <Code2 className="w-4 h-4" />,
      description: 'Fenced code with syntax highlighting',
      action: (ed) => ed.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: 'blockquote',
      label: 'Quote',
      icon: <Quote className="w-4 h-4" />,
      description: 'Highlighted quotation block',
      action: (ed) => ed.chain().focus().toggleBlockquote().run(),
    },
    {
      id: 'bulletList',
      label: 'Bullet List',
      icon: <List className="w-4 h-4" />,
      description: 'Unordered list',
      action: (ed) => ed.chain().focus().toggleBulletList().run(),
    },
    {
      id: 'orderedList',
      label: 'Ordered List',
      icon: <ListOrdered className="w-4 h-4" />,
      description: 'Numbered list',
      action: (ed) => ed.chain().focus().toggleOrderedList().run(),
    },
  ];

  if (!show || !coords) return null;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
        aria-label="Upload image"
      />

      <div
        style={{
          position: 'fixed',
          top: `${coords.top}px`,
          left: `${coords.left}px`,
          zIndex: 50,
        }}
        ref={menuRef}
        className="flex items-center"
      >
        <button
          type="button"
          aria-label="Insert block"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
          className={`
            w-7 h-7 rounded-full border flex items-center justify-center
            transition-all duration-200 shadow-sm
            ${
              uploading
                ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-wait'
                : isOpen
                ? 'border-[var(--color-primary-light)] bg-[var(--color-primary-light)] text-white shadow-md scale-110'
                : 'border-slate-300 bg-white text-slate-400 hover:border-[var(--color-primary-light)] hover:text-[var(--color-primary-light)] hover:scale-110'
            }
          `}
        >
          {uploading ? (
            <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isOpen ? 'rotate-45' : ''
              }`}
            />
          )}
        </button>

        {isOpen && (
          <div
            role="menu"
            aria-label="Insert block type"
            className="
              absolute left-10 top-1/2 -translate-y-1/2
              w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl
              p-2 z-50 overflow-hidden
            "
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
              Insert Block
            </p>
            <div className="space-y-0.5">
              {blockOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    opt.action(editor);
                    if (opt.id !== 'image') setIsOpen(false);
                  }}
                  className="
                    w-full flex items-center gap-3 px-3 py-2 rounded-xl
                    text-left transition-all duration-100
                    hover:bg-slate-50 focus:outline-none focus:bg-slate-50
                    text-slate-700 hover:text-[var(--color-primary-light)]
                    group
                  "
                >
                  <span
                    className="
                    w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[var(--color-primary-light)]/10
                    flex items-center justify-center text-slate-500
                    group-hover:text-[var(--color-primary-light)] transition-colors flex-shrink-0
                  "
                  >
                    {opt.icon}
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 truncate">{opt.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingBlockMenu;
