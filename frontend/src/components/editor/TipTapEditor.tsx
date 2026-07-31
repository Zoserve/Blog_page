import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { SelectionBubbleMenu } from './SelectionBubbleMenu';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import css from 'highlight.js/lib/languages/css';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import FloatingBlockMenu from './FloatingBlockMenu';
import api from '../../services/api';
import imageCompression from 'browser-image-compression';

// ---------------------------------------------------------------------------
// lowlight syntax highlighting setup
// ---------------------------------------------------------------------------
const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('css', css);
lowlight.register('bash', bash);
lowlight.register('sql', sql);
lowlight.register('xml', xml);

const MAX_IMAGE_MB = 10;

interface Props {
  /** HTML string (converted from Markdown before passing in) */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const TipTapEditor: React.FC<Props> = ({
  value,
  onChange,
  placeholder = 'Start writing... press "/" or click "+" to insert a block.',
}) => {
  const [error, setError] = useState<string | null>(null);
  const lastHtmlRef = useRef<string>(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false, // replaced by CodeBlockLowlight
        link: false, // prevents duplicate 'link' extension warning
      }),
      Image.configure({ allowBase64: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube.configure({ width: '100%', height: 480, nocookie: true }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'javascript' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastHtmlRef.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose-custom focus:outline-none min-h-[400px] px-8 py-6',
      },
      // Handle image paste from clipboard
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();
              handleImageUpload(file);
              return true;
            }
          }
        }
        return false;
      },
      // Handle image drag-drop into editor body
      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Sync external value changes (e.g. loading existing post)
  useEffect(() => {
    if (editor && value !== lastHtmlRef.current) {
      editor.commands.setContent(value, false);
      lastHtmlRef.current = value;
    }
  }, [editor, value]);

  // ---------------------------------------------------------------------------
  // Image upload helper (shared by drag-drop, paste, and FloatingMenu)
  // ---------------------------------------------------------------------------
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        setError(`Image must be under ${MAX_IMAGE_MB}MB.`);
        return;
      }
      setError(null);

      // Insert inline loading placeholder
      const placeholderId = `img-placeholder-${Date.now()}`;
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

        // Replace placeholder with real image
        const { state, view } = editor;
        let placeholderPos: number | null = null;
        state.doc.descendants((node, pos) => {
          if (
            node.type.name === 'paragraph' &&
            node.firstChild?.type.name === 'text' &&
            node.firstChild.text?.includes(placeholderId)
          ) {
            placeholderPos = pos;
          }
        });

        if (placeholderPos !== null) {
          const nodeAtPos = state.doc.nodeAt(placeholderPos);
          if (nodeAtPos) {
            const tr = state.tr.replaceWith(
              placeholderPos,
              placeholderPos + nodeAtPos.nodeSize,
              state.schema.nodes.image.create({ src: imageUrl, alt: file.name })
            );
            view.dispatch(tr);
          }
        } else {
          editor.chain().focus().setImage({ src: imageUrl, alt: file.name }).run();
        }
      } catch (err) {
        console.error('Image upload failed', err);
        setError('Image upload failed. Please try again.');
        editor.chain().undo().run();
      }
    },
    [editor]
  );

  // ---------------------------------------------------------------------------
  // BubbleMenu: link toggling helper
  // ---------------------------------------------------------------------------
  const handleLinkToggle = useCallback(() => {
    if (!editor) return;
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = prompt('Enter URL:');
      if (url) editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-[var(--color-primary-light)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-3 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-3 text-red-400 hover:text-red-600 font-bold leading-none"
          >
            x
          </button>
        </div>
      )}

      {/* ── SelectionBubbleMenu: appears on text selection ── */}
      <SelectionBubbleMenu editor={editor} />

      {/* ── FloatingMenu: "+" on empty lines ── */}
      <FloatingBlockMenu editor={editor} onInsertError={setError} />

      {/* ── Editor content area ── */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
