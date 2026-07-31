import React, { useState, useRef, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
}

// Suggested tags from the backend seed data -- purely for UI hints
const SUGGESTIONS = [
  'React', 'Spring Boot', 'Java', 'TypeScript', 'Tailwind CSS',
  'Next.js', 'AI & LLMs', 'SEO', 'Security', 'PostgreSQL', 'MySQL', 'DevOps',
];

const TagsInput: React.FC<Props> = ({ tags, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = SUGGESTIONS.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(s)
  );

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.replace(/,$/, ''));
    }
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-premium space-y-3">
      <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
        Tags
      </h3>

      {/* Pills + input row */}
      <div
        className="flex flex-wrap gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-[var(--color-primary-light)] focus-within:bg-white transition-all min-h-[40px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)] text-[10px] font-bold rounded-full border border-[var(--color-primary-light)]/20"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="w-3 h-3 rounded-full hover:bg-[var(--color-primary-light)]/20 flex items-center justify-center transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={tags.length === 0 ? 'Add tags (Enter or comma to add)' : ''}
          className="flex-grow min-w-[120px] text-xs bg-transparent focus:outline-none text-slate-700 placeholder:text-slate-400"
          aria-label="Add tag"
        />
      </div>

      {/* Autocomplete suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && inputValue && (
        <div className="border border-slate-200 rounded-xl bg-white shadow-lg overflow-hidden">
          {filteredSuggestions.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => addTag(s)}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[var(--color-primary-light)] font-medium transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <p className="text-[10px] text-slate-400 font-medium">
        Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px]">Enter</kbd> or{' '}
        <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px]">,</kbd> to add a tag
      </p>
    </div>
  );
};

export default TagsInput;
