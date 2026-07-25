import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Copy, Check, Search, AlertCircle, FileImage } from 'lucide-react';
import api from '../services/api';

interface ImageMedia {
  id: number;
  name: string;
  url: string;
  contentType: string;
  size: number;
  createdAt: string;
}

const AdminMedia: React.FC = () => {
  const [images, setImages] = useState<ImageMedia[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/media');
      setImages(res.data);
    } catch (err) {
      setError('Failed to fetch media assets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Safety size check: 10MB limit matching backend properties
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    setError('');

    try {
      await api.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchImages();
    } catch (err) {
      setError('Failed to upload image. Make sure file size fits boundaries.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this image? If it is embedded in articles, they will display broken links.')) return;
    try {
      await api.delete(`/admin/media/${id}`);
      fetchImages();
    } catch (err) {
      alert('Failed to delete image');
      console.error(err);
    }
  };

  const handleCopyLink = (img: ImageMedia) => {
    // We copy the absolute backend URL, or relative URL depending on user environments. 
    // Absolute backend URL is best for testing markdown renderer locally. Let's copy absolute URL.
    const absoluteBackendUrl = `http://localhost:9090${img.url}`;
    
    navigator.clipboard.writeText(absoluteBackendUrl);
    setCopiedId(img.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredImages = images.filter((img) =>
    img.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Media Library</h2>
          <p className="text-xs text-slate-400 mt-1">Upload and catalog images for your articles.</p>
        </div>
        
        {/* Upload Button */}
        <label className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-premium flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex relative items-center max-w-md w-full">
          <input
            type="text"
            placeholder="Search images by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs placeholder:text-slate-400"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>
        <div className="text-slate-400 text-xs">
          Total Assets: {filteredImages.length}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 text-xs font-medium">
          <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid listing */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-[var(--color-primary-light)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 text-sm shadow-premium flex flex-col items-center justify-center">
          <FileImage className="w-12 h-12 text-slate-300 mb-3" />
          <p>No image assets found. Upload images to embed them in your articles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredImages.map((img) => (
            <div key={img.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-premium group relative hover:border-slate-300 transition-all flex flex-col">
              {/* Preview */}
              <div className="aspect-square w-full bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                <img
                  src={`http://localhost:9090${img.url}`}
                  alt={img.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback on load error
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=300';
                  }}
                />
              </div>

              {/* Info panel */}
              <div className="p-3 space-y-1 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-800 truncate mb-0.5" title={img.name}>
                    {img.name}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-medium">{formatBytes(img.size)}</p>
                </div>
                
                {/* Actions overlay / bottom */}
                <div className="flex items-center space-x-1.5 pt-2">
                  <button
                    onClick={() => handleCopyLink(img)}
                    className="flex-grow py-1 px-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center space-x-1 text-[9px] font-semibold"
                    title="Copy MD Link"
                  >
                    {copiedId === img.id ? (
                      <>
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="p-1 border border-red-100 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors shrink-0"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
