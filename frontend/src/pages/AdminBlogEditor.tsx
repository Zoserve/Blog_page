import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Globe, Code, Heading, Bold, Italic, Link as LinkIcon, Quote, Image as ImageIcon, Video, Table, Plus, Trash2, HelpCircle } from 'lucide-react';
import api from '../services/api';
import { parseMarkdownToHtml } from '../utils/markdown';

interface Category {
  id: number;
  name: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

const AdminBlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  // Form Fields State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [tags, setTags] = useState('');
  const [heroImage, setHeroImage] = useState('');
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // FAQ State
  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  // SEO State
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Dropdowns lists
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load categories
    const fetchCategories = async () => {
      try {
        const res = await api.get('/public/categories');
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();

    // If edit mode, load existing blog
    if (isEditMode) {
      const fetchBlog = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/admin/blogs/${id}`);
          const blog = res.data;
          
          setTitle(blog.title);
          setSlug(blog.slug);
          setShortDescription(blog.shortDescription);
          setContent(blog.content);
          setCategoryId(blog.category.id.toString());
          setTags(blog.tags.map((t: any) => t.name).join(', '));
          setHeroImage(blog.heroImage || '');
          
          setSeoTitle(blog.seoTitle || '');
          setSeoDescription(blog.seoDescription || '');
          setMetaKeywords(blog.metaKeywords || '');
          setOgImage(blog.ogImage || '');
          setCanonicalUrl(blog.canonicalUrl || '');

          // Restore FAQs if present
          if (blog.faqSchema) {
            try {
              // faqSchema is stored as a compiled schema, so we parse mainEntity array
              const parsed = JSON.parse(blog.faqSchema);
              const items = parsed.mainEntity.map((item: any) => ({
                question: item.name,
                answer: item.acceptedAnswer.text
              }));
              setFaqs(items);
            } catch (e) {
              console.error('Failed to parse FAQ schema', e);
            }
          }
        } catch (err) {
          alert('Failed to load blog post');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchBlog();
    }
  }, [id, isEditMode]);

  // Handle Slug generation
  const generateSlug = () => {
    const slugged = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(slugged);
  };

  // Markdown Toolbar actions
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = prefix + (selected || '') + suffix;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    setContent(newContent);
    
    // Reset focus and cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 0));
    }, 50);
  };

  // FAQ List Helpers
  const addFaqItem = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const removeFaqItem = (index: number) => {
    setFaqs(faqs.filter((_, idx) => idx !== index));
  };

  // Submit Handler
  const handleSave = async (isPublished: boolean) => {
    if (!title || !shortDescription || !content || !categoryId) {
      alert('Please fill in all mandatory fields (Title, Category, Short Description, Content)');
      return;
    }

    setSaving(true);
    
    // Filter empty faqs
    const validFaqs = faqs.filter(f => f.question.trim() && f.answer.trim());
    const faqSchemaJson = validFaqs.length > 0 ? JSON.stringify(validFaqs) : '';

    // Split tags by comma
    const tagSet = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '');

    const payload = {
      title,
      slug: slug || undefined, // backend generates if empty
      shortDescription,
      content,
      categoryId: parseInt(categoryId),
      tags: tagSet,
      heroImage,
      isPublished,
      seoTitle,
      seoDescription,
      metaKeywords,
      ogImage,
      canonicalUrl,
      faqSchema: faqSchemaJson || null
    };

    try {
      if (isEditMode) {
        await api.put(`/admin/blogs/${id}`, payload);
      } else {
        await api.post('/admin/blogs', payload);
      }
      navigate('/blog/admin/blogs');
    } catch (err) {
      alert('Failed to save blog post. Ensure slug is unique.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[var(--color-primary-light)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/blog/admin/blogs" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>
        
        {/* Save Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Publish Article</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor Section (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Blog Title *</label>
              <input
                type="text"
                required
                placeholder="Enter title (e.g. Scaling Spring Boot applications on Kubernetes)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] focus:bg-white text-sm text-slate-800 font-semibold"
              />
            </div>

            {/* Slug row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Slug URL path</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="custom-slug-here"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-grow px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="px-3 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-[10px] font-semibold text-slate-600"
                  >
                    Auto
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs text-slate-600 cursor-pointer"
                >
                  <option value="">Select a Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Short Description *</label>
              <textarea
                required
                rows={3}
                placeholder="Write a brief, high-impact summary of this article for listings and meta descriptions."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] focus:bg-white text-xs text-slate-600 leading-relaxed"
              />
            </div>
          </div>

          {/* Core Content Markdown Editor */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-premium overflow-hidden flex flex-col min-h-[500px]">
            {/* Header Tabs and Toolbar */}
            <div className="border-b border-slate-100 bg-slate-50/50">
              <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                <div className="flex space-x-2 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeTab === 'edit' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500'
                    }`}
                  >
                    Edit Markdown
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeTab === 'preview' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500'
                    }`}
                  >
                    Real-time Preview
                  </button>
                </div>
                
                <span className="text-[10px] text-slate-400 font-medium">Supports GitHub Markdown</span>
              </div>

              {/* Editing Toolbar */}
              {activeTab === 'edit' && (
                <div className="p-2 border-b border-slate-100 flex flex-wrap gap-1 items-center bg-white text-slate-500">
                  <button type="button" onClick={() => insertMarkdown('## ')} className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg" title="H2 Header"><Heading className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown('### ')} className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg" title="H3 Header"><span className="text-[10px] font-bold">H3</span></button>
                  <button type="button" onClick={() => insertMarkdown('**', '**')} className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg" title="Bold text"><Bold className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown('*', '*')} className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg" title="Italic text"><Italic className="w-3.5 h-3.5" /></button>
                  <span className="h-4 w-[1px] bg-slate-200 mx-1"></span>
                  <button type="button" onClick={() => insertMarkdown('> ')} className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg" title="Quote block"><Quote className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown('`', '`')} className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg" title="Inline code"><Code className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown('```javascript\n', '\n```')} className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg" title="Code block"><span className="text-[10px] font-mono">JS</span></button>
                  <span className="h-4 w-[1px] bg-slate-200 mx-1"></span>
                  <button type="button" onClick={() => insertMarkdown('[', '](https://)')} className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg" title="Insert Link"><LinkIcon className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown('![alt text](', ')')} className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg" title="Insert Image"><ImageIcon className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown('[YouTube Video](https://www.youtube.com/watch?v=')} className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg" title="Insert YouTube"><Video className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown('\n| Header 1 | Header 2 |\n|---|---|\n| Cell 1 | Cell 2 |\n')} className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg" title="Insert Table"><Table className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>

            {/* View Port Panel */}
            <div className="flex-grow flex flex-col bg-white">
              {activeTab === 'edit' ? (
                <textarea
                  id="markdown-editor"
                  required
                  placeholder="Start drafting in markdown..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-grow w-full p-6 text-sm font-mono text-slate-800 focus:outline-none resize-none leading-relaxed min-h-[400px]"
                />
              ) : (
                <div className="p-6 overflow-y-auto max-w-none prose-custom select-text select-all" dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(content) }} />
              )}
            </div>
          </div>

          {/* FAQ Builder */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-[var(--color-primary-light)]" />
                <span>Interactive FAQ Builder</span>
              </h3>
              <button
                type="button"
                onClick={addFaqItem}
                className="inline-flex items-center space-x-1 px-3 py-1.5 border border-[var(--color-primary-light)] text-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)]/10 text-[10px] font-bold rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add FAQ Item</span>
              </button>
            </div>
            
            {faqs.length === 0 ? (
              <p className="text-xs text-slate-400 leading-relaxed">
                Add standard questions and answers. The CMS will automatically construct the corresponding **FAQPage JSON-LD schema** for google search engine snippets.
              </p>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeFaqItem(idx)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div>
                      <input
                        type="text"
                        placeholder="Question (e.g. Do you support mobile deployment?)"
                        value={faq.question}
                        onChange={(e) => updateFaqItem(idx, 'question', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[var(--color-primary-light)]"
                      />
                    </div>
                    <div>
                      <textarea
                        rows={2}
                        placeholder="Answer (Provide a helpful response)"
                        value={faq.answer}
                        onChange={(e) => updateFaqItem(idx, 'answer', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed focus:outline-none focus:border-[var(--color-primary-light)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Configurations Sidepanel (Right 1 col) */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Article Metadata</h3>
            
            {/* Hero Image */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hero Image URL</label>
              <input
                type="text"
                placeholder="e.g. /api/v1/public/images/12"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs text-slate-600"
              />
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                Copy the URL of an image from the <Link to="/blog/admin/media" target="_blank" className="text-[var(--color-primary-light)] underline hover:text-[var(--color-primary)]">Media Library</Link> and paste it here.
              </p>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tags (Comma Separated)</label>
              <input
                type="text"
                placeholder="e.g. React, Spring Boot, Webdev"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs text-slate-600"
              />
            </div>
          </div>

          {/* SEO Details Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">SEO Configurations</h3>
            
            {/* SEO Title */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">SEO Meta Title</label>
              <input
                type="text"
                placeholder="SEO Title (defaults to Title)"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs text-slate-600"
              />
            </div>

            {/* SEO Description */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">SEO Meta Description</label>
              <textarea
                rows={3}
                placeholder="SEO Description (defaults to summary)"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs text-slate-600 leading-normal"
              />
            </div>

            {/* Meta Keywords */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Meta Keywords</label>
              <input
                type="text"
                placeholder="comma, separated, keywords"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs text-slate-600"
              />
            </div>

            {/* OG Image */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Open Graph Image URL</label>
              <input
                type="text"
                placeholder="defaults to Hero Image URL"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs text-slate-600"
              />
            </div>

            {/* Canonical URL */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Canonical URL</label>
              <input
                type="text"
                placeholder="https://blog.zoserve.com/blog/slug"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs text-slate-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogEditor;
