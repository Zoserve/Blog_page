import React from 'react';
import { Editor } from '@tiptap/react';
import { Undo2, Redo2 } from 'lucide-react';

interface Props {
  editor: Editor | null;
}

const EditorToolbar: React.FC<Props> = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 bg-slate-50/70">
      {/* History group */}
      <div className="flex items-center gap-0.5">
        <ToolbarBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
          label="Undo"
          icon={<Undo2 className="w-3.5 h-3.5" />}
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
          label="Redo"
          icon={<Redo2 className="w-3.5 h-3.5" />}
        />
      </div>

      {/* Hint text */}
      <span className="ml-auto text-[10px] text-slate-400 font-medium select-none">
        Click <span className="font-bold text-slate-500">+</span> on an empty line to insert blocks
      </span>
    </div>
  );
};

// ── Toolbar button helper ───────────────────────────────────────────────────
interface ToolbarBtnProps {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const ToolbarBtn: React.FC<ToolbarBtnProps> = ({
  onClick,
  disabled,
  title,
  label,
  icon,
  active,
}) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    disabled={disabled}
    onClick={onClick}
    className={`
      inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold
      transition-all duration-100
      ${active
        ? 'bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)]'
        : disabled
          ? 'text-slate-300 cursor-not-allowed'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default EditorToolbar;
