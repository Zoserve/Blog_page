import React, { useRef, useState, useCallback } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import api, { formatImageUrl } from '../../services/api';
import imageCompression from 'browser-image-compression';

interface Props {
  value: string; // current heroImage URL
  onChange: (url: string) => void;
}

const MAX_MB = 10;

const FeaturedImageUpload: React.FC<Props> = ({ value, onChange }) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`Image must be under ${MAX_MB}MB.`);
        return;
      }

      setUploading(true);
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
        const url: string = res.data.url || `/api/v1/public/images/${res.data.id}`;
        onChange(url);
      } catch (err) {
        console.error('Featured image upload failed', err);
        setError('Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const previewUrl = value ? formatImageUrl(value) : null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-premium space-y-3">
      <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
        Featured Image
      </h3>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
        aria-label="Upload featured image"
      />

      {previewUrl ? (
        /* Thumbnail with remove button */
        <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
          <img
            src={previewUrl}
            alt="Featured"
            className="w-full aspect-video object-cover"
            onError={(e) =>
              ((e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600')
            }
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-300 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
            title="Remove featured image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent p-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-white text-[10px] font-semibold underline"
            >
              Change image
            </button>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload featured image by clicking or dragging"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl
            border-2 border-dashed cursor-pointer transition-all duration-200 text-center
            ${dragging
              ? 'border-[var(--color-primary-light)] bg-[var(--color-primary-light)]/5'
              : 'border-slate-200 hover:border-[var(--color-primary-light)]/50 hover:bg-slate-50'
            }
          `}
        >
          {uploading ? (
            <div className="w-7 h-7 border-2 border-[var(--color-primary-light)] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                {dragging ? (
                  <UploadCloud className="w-5 h-5 text-[var(--color-primary-light)]" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <p className="text-xs font-semibold text-slate-600">
                {dragging ? 'Drop to upload' : 'Click or drag to upload'}
              </p>
              <p className="text-[10px] text-slate-400">PNG, JPG, WebP -- max {MAX_MB}MB</p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-[10px] font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FeaturedImageUpload;
