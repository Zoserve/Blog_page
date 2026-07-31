import React from 'react';
import { Save, Globe, Eye, Clock } from 'lucide-react';

interface MissingField {
  field: string;
  label: string;
}

interface Props {
  isPublished: boolean;
  saving: boolean;
  autosaveStatus: 'idle' | 'saving' | 'saved';
  autosaveTime: string | null;
  isPublishReady: boolean;
  missingFields: MissingField[];
  onSaveDraft: () => void;
  onPublish: () => void;
  onPreview: () => void;
}

const PublishBox: React.FC<Props> = ({
  isPublished,
  saving,
  autosaveStatus,
  autosaveTime,
  isPublishReady,
  missingFields,
  onSaveDraft,
  onPublish,
  onPreview,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-premium space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800 text-sm">Publish</h3>
        {/* Status badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            isPublished
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isPublished ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
          {isPublished ? 'Published' : 'Draft'}
        </span>
      </div>

      {/* Autosave indicator */}
      <div className="flex items-center gap-1.5 text-[10px] font-medium">
        <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
        {autosaveStatus === 'saving' && (
          <span className="text-slate-400 animate-pulse">Saving...</span>
        )}
        {autosaveStatus === 'saved' && autosaveTime && (
          <span className="text-slate-400">
            Saved at <span className="text-slate-600 font-semibold">{autosaveTime}</span>
          </span>
        )}
        {autosaveStatus === 'idle' && (
          <span className="text-slate-300">No unsaved changes</span>
        )}
      </div>

      {/* Missing fields hint */}
      {!isPublishReady && missingFields.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-700 font-semibold space-y-1">
          <p className="font-bold text-amber-800">Required to publish:</p>
          <ul className="list-disc pl-3.5 space-y-0.5">
            {missingFields.map((f) => (
              <li key={f.field}>{f.label}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          Save Draft
        </button>

        <button
          type="button"
          onClick={onPublish}
          disabled={saving || !isPublishReady}
          title={
            !isPublishReady
              ? `Fill in: ${missingFields.map((f) => f.label).join(', ')}`
              : undefined
          }
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5" />
          {isPublished ? 'Update & Publish' : 'Publish Article'}
        </button>

        <button
          type="button"
          onClick={onPreview}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview in new tab
        </button>
      </div>
    </div>
  );
};

export default PublishBox;
