import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link, useBeforeUnload } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import { markdownToHtml, htmlToMarkdown } from '../utils/markdownConvert';

// Editor sub-components
import TipTapEditor from '../components/editor/TipTapEditor';
import EditorToolbar from '../components/editor/EditorToolbar';
import PublishBox from '../components/editor/PublishBox';
import FeaturedImageUpload from '../components/editor/FeaturedImageUpload';
import TagsInput from '../components/editor/TagsInput';
import SeoPanel from '../components/editor/SeoPanel';

// ── We import the TipTap editor ref type lazily via a small hook ─────────────
import { useEditor } from '@tiptap/react';

interface Category {
  id: number;
  name: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

// localStorage autosave key
const autosaveKey = (id: string | undefined) =>
  id ? `blog-autosave-${id}` : 'blog-autosave-new';

// ── Main component ────────────────────────────────────────────────────────────
const AdminBlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  // ── Core field state ────────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [contentHtml, setContentHtml] = useState(''); // TipTap HTML
  const [categoryId, setCategoryId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [heroImage, setHeroImage] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // SEO fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // FAQ state (preserved from original)
  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Autosave
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [autosaveTime, setAutosaveTime] = useState<string | null>(null);
  const [recoveryBanner, setRecoveryBanner] = useState<{ time: string } | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedPayloadRef = useRef<string>('');

  // TipTap editor ref (passed down for toolbar undo/redo)
  const [editorInstance, setEditorInstance] = useState<ReturnType<typeof useEditor>>(null);

  // ── Load categories ───────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/public/categories').then((res) => setCategories(res.data)).catch(console.error);
  }, []);

  // ── Load blog data (edit mode) ────────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return;

    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/blogs/${id}`);
        const blog = res.data;

        setTitle(blog.title);
        setSlug(blog.slug);
        setShortDescription(blog.shortDescription);
        // Convert stored Markdown → HTML for TipTap
        setContentHtml(markdownToHtml(blog.content || ''));
        setCategoryId(blog.category.id.toString());
        setTags(blog.tags?.map((t: any) => t.name) ?? []);
        setHeroImage(blog.heroImage || '');
        setIsPublished(blog.isPublished ?? false);

        setSeoTitle(blog.seoTitle || '');
        setSeoDescription(blog.seoDescription || '');
        setMetaKeywords(blog.metaKeywords || '');
        setOgImage(blog.ogImage || '');
        setCanonicalUrl(blog.canonicalUrl || '');

        if (blog.faqSchema) {
          try {
            const parsed = JSON.parse(blog.faqSchema);
            setFaqs(
              parsed.mainEntity?.map((item: any) => ({
                question: item.name,
                answer: item.acceptedAnswer.text,
              })) ?? []
            );
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
  }, [id, isEditMode]);

  // ── Check for an autosave on mount ───────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(autosaveKey(id));
    if (!saved) return;
    try {
      const { timestamp } = JSON.parse(saved);
      const savedDate = new Date(timestamp);
      setRecoveryBanner({
        time: savedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      // ignore corrupted autosave
    }
  }, [id]);

  // ── Mark form as dirty on any field change ────────────────────────────────
  useEffect(() => {
    setIsDirty(true);
  }, [
    title, slug, shortDescription, contentHtml, categoryId,
    tags, heroImage, seoTitle, seoDescription, metaKeywords, ogImage, canonicalUrl, faqs,
  ]);

  // ── beforeunload guard ────────────────────────────────────────────────────
  useBeforeUnload(
    useCallback(
      (e) => {
        if (isDirty && !saving) {
          e.preventDefault();
        }
      },
      [isDirty, saving]
    )
  );

  // ── Autosave every 30s ────────────────────────────────────────────────────
  const doAutosave = useCallback(() => {
    const payload = JSON.stringify({
      title,
      slug,
      shortDescription,
      contentHtml,
      categoryId,
      tags,
      heroImage,
      seoTitle,
      seoDescription,
      metaKeywords,
      ogImage,
      canonicalUrl,
      faqs,
      timestamp: Date.now(),
    });

    if (payload === lastSavedPayloadRef.current) return; // nothing changed
    lastSavedPayloadRef.current = payload;

    setAutosaveStatus('saving');
    try {
      localStorage.setItem(autosaveKey(id), payload);
      const t = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      setAutosaveTime(t);
      setAutosaveStatus('saved');
    } catch (e) {
      console.error('Autosave failed', e);
      setAutosaveStatus('idle');
    }
  }, [
    title, slug, shortDescription, contentHtml, categoryId,
    tags, heroImage, seoTitle, seoDescription, metaKeywords, ogImage, canonicalUrl, faqs, id,
  ]);

  useEffect(() => {
    autosaveTimerRef.current = setInterval(doAutosave, 30_000);
    return () => {
      if (autosaveTimerRef.current) clearInterval(autosaveTimerRef.current);
    };
  }, [doAutosave]);

  // ── Restore from autosave ────────────────────────────────────────────────
  const handleRestore = () => {
    const saved = localStorage.getItem(autosaveKey(id));
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      setTitle(data.title ?? '');
      setSlug(data.slug ?? '');
      setShortDescription(data.shortDescription ?? '');
      setContentHtml(data.contentHtml ?? '');
      setCategoryId(data.categoryId ?? '');
      setTags(data.tags ?? []);
      setHeroImage(data.heroImage ?? '');
      setSeoTitle(data.seoTitle ?? '');
      setSeoDescription(data.seoDescription ?? '');
      setMetaKeywords(data.metaKeywords ?? '');
      setOgImage(data.ogImage ?? '');
      setCanonicalUrl(data.canonicalUrl ?? '');
      setFaqs(data.faqs ?? []);
    } catch (e) {
      console.error('Failed to restore autosave', e);
    }
    setRecoveryBanner(null);
  };

  const handleDiscardRecovery = () => {
    localStorage.removeItem(autosaveKey(id));
    setRecoveryBanner(null);
  };

  // ── Slug auto-generate ───────────────────────────────────────────────────
  const generateSlug = () => {
    const slugged = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(slugged);
  };

  // ── FAQ helpers (preserved) ───────────────────────────────────────────────
  const addFaqItem = () => setFaqs([...faqs, { question: '', answer: '' }]);

  const updateFaqItem = (
    index: number,
    field: 'question' | 'answer',
    value: string
  ) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const removeFaqItem = (index: number) =>
    setFaqs(faqs.filter((_, idx) => idx !== index));

  // ── Validation ────────────────────────────────────────────────────────────
  const missingFields = [
    !title && { field: 'title', label: 'Title' },
    !categoryId && { field: 'categoryId', label: 'Category' },
    !shortDescription && { field: 'shortDescription', label: 'Short Description' },
  ].filter(Boolean) as { field: string; label: string }[];

  const isPublishReady = missingFields.length === 0;

  // ── Save / Publish ────────────────────────────────────────────────────────
  const handleSave = async (publish: boolean) => {
    if (publish && !isPublishReady) return;
    setSaving(true);

    const validFaqs = faqs.filter((f) => f.question.trim() && f.answer.trim());
    const faqSchemaJson =
      validFaqs.length > 0
        ? JSON.stringify({
            '@type': 'FAQPage',
            mainEntity: validFaqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          })
        : null;

    const payload = {
      title,
      slug: slug || undefined,
      shortDescription,
      content: htmlToMarkdown(contentHtml), // HTML → Markdown for backend
      categoryId: parseInt(categoryId),
      tags,
      heroImage,
      isPublished: publish,
      seoTitle,
      seoDescription,
      metaKeywords,
      ogImage,
      canonicalUrl,
      faqSchema: faqSchemaJson,
    };

    try {
      if (isEditMode) {
        await api.put(`/admin/blogs/${id}`, payload);
      } else {
        await api.post('/admin/blogs', payload);
      }
      // Clear autosave on successful save
      localStorage.removeItem(autosaveKey(id));
      setIsDirty(false);
      navigate('/blog/admin/blogs');
    } catch (err: any) {
      alert('Failed to save. Please ensure the slug is unique.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (slug) window.open(`/blog/${slug}`, '_blank');
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[var(--color-primary-light)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-6">

      {/* ── Recovery Banner ─────────────────────────────────────────────── */}
      {recoveryBanner && (
        <div className="flex items-center justify-between gap-4 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-sm">
          <p className="text-amber-800 font-semibold text-xs">
            💾 We found an unsaved draft from{' '}
            <span className="font-bold">{recoveryBanner.time}</span>
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleRestore}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={handleDiscardRecovery}
              className="px-3 py-1.5 border border-amber-300 text-amber-700 hover:bg-amber-100 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* ── Top navigation ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link
          to="/blog/admin/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>
        <span className="text-slate-300">·</span>
        <span className="text-xs font-semibold text-slate-400">
          {isEditMode ? 'Edit Article' : 'New Article'}
        </span>
      </div>

      {/* ── TOP BLOCK: Title + Slug + Short Description ─────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium space-y-5">
        {/* Title */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Blog Title *
          </label>
          <input
            type="text"
            required
            id="field-title"
            placeholder="e.g. Scaling Spring Boot applications on Kubernetes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`
              w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none text-base text-slate-800 font-bold
              focus:bg-white transition-colors
              ${!title && missingFields.some((f) => f.field === 'title')
                ? 'border-red-300 focus:border-red-400'
                : 'border-slate-200 focus:border-[var(--color-primary-light)]'
              }
            `}
          />
          {!title && missingFields.some((f) => f.field === 'title') && (
            <p className="text-[10px] text-red-500 font-semibold mt-1">Title is required to publish</p>
          )}
        </div>

        {/* Slug + Short Description row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Slug */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              URL Slug
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="field-slug"
                placeholder="custom-slug-here"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-grow px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs text-slate-600 font-mono"
              />
              <button
                type="button"
                onClick={generateSlug}
                className="px-3 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-[10px] font-bold text-slate-600 flex-shrink-0 transition-colors"
              >
                Auto
              </button>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Short Description *
            </label>
            <textarea
              required
              id="field-description"
              rows={2}
              placeholder="A brief, high-impact summary for listings and meta descriptions"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className={`
                w-full px-3 py-2.5 bg-slate-50 border rounded-xl focus:outline-none text-xs text-slate-600 leading-relaxed
                focus:bg-white transition-colors resize-none
                ${!shortDescription && missingFields.some((f) => f.field === 'shortDescription')
                  ? 'border-red-300 focus:border-red-400'
                  : 'border-slate-200 focus:border-[var(--color-primary-light)]'
                }
              `}
            />
            {!shortDescription && missingFields.some((f) => f.field === 'shortDescription') && (
              <p className="text-[10px] text-red-500 font-semibold mt-1">Description is required to publish</p>
            )}
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Editor (70%) ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* WYSIWYG Editor card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-premium overflow-hidden">
            {/* Slim toolbar: Undo/Redo */}
            <EditorToolbar editor={editorInstance} />

            {/* TipTap editor body */}
            <TipTapEditor
              value={contentHtml}
              onChange={setContentHtml}
              placeholder='Click "+" on a new line to insert a block, or start typing...'
            />
          </div>

          {/* FAQ Builder (preserved) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[var(--color-primary-light)]" />
                FAQ Builder
              </h3>
              <button
                type="button"
                onClick={addFaqItem}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-[var(--color-primary-light)] text-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)]/10 text-[10px] font-bold rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add FAQ
              </button>
            </div>

            {faqs.length === 0 ? (
              <p className="text-xs text-slate-400 leading-relaxed">
                Add Q&amp;A pairs here. The CMS will generate FAQPage JSON-LD schema for Google rich snippets.
              </p>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeFaqItem(idx)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      placeholder="Question"
                      value={faq.question}
                      onChange={(e) => updateFaqItem(idx, 'question', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[var(--color-primary-light)]"
                    />
                    <textarea
                      rows={2}
                      placeholder="Answer"
                      value={faq.answer}
                      onChange={(e) => updateFaqItem(idx, 'answer', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed focus:outline-none focus:border-[var(--color-primary-light)]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Sidebar (30%) sticky ────────────────────────────────── */}
        <div className="space-y-5 lg:sticky lg:top-20 lg:self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">

          {/* Publish box */}
          <PublishBox
            isPublished={isPublished}
            saving={saving}
            autosaveStatus={autosaveStatus}
            autosaveTime={autosaveTime}
            isPublishReady={isPublishReady}
            missingFields={missingFields}
            onSaveDraft={() => handleSave(false)}
            onPublish={() => handleSave(true)}
            onPreview={handlePreview}
          />

          {/* Featured image */}
          <FeaturedImageUpload value={heroImage} onChange={setHeroImage} />

          {/* Category */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-premium">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Category *
            </label>
            <select
              id="field-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`
                w-full px-3 py-2.5 bg-slate-50 border rounded-xl focus:outline-none text-xs text-slate-700 cursor-pointer appearance-none
                transition-colors
                ${!categoryId && missingFields.some((f) => f.field === 'categoryId')
                  ? 'border-red-300 focus:border-red-400'
                  : 'border-slate-200 focus:border-[var(--color-primary-light)]'
                }
              `}
            >
              <option value="" disabled>
                -- Select a Category --
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {!categoryId && missingFields.some((f) => f.field === 'categoryId') && (
              <p className="text-[10px] text-red-500 font-semibold mt-1.5">Category is required to publish</p>
            )}
          </div>

          {/* Tags */}
          <TagsInput tags={tags} onChange={setTags} />

          {/* SEO meta fields */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-premium space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
              SEO Metadata
            </h3>

            <Field label="SEO Meta Title">
              <input
                type="text"
                placeholder="SEO Title (defaults to Blog Title)"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs text-slate-600"
              />
            </Field>

            <Field label="Meta Description">
              <textarea
                rows={3}
                placeholder="Meta description (defaults to Short Description)"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs text-slate-600 leading-normal resize-none"
              />
            </Field>

            <Field label="Meta Keywords">
              <input
                type="text"
                placeholder="comma, separated, keywords"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs text-slate-600"
              />
            </Field>

            <Field label="OG Image URL">
              <input
                type="text"
                placeholder="defaults to Featured Image"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs text-slate-600"
              />
            </Field>

            <Field label="Canonical URL">
              <input
                type="text"
                placeholder="https://zoserve.com/blog/slug"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-xs text-slate-600"
              />
            </Field>
          </div>

          {/* SEO live feedback panel */}
          <SeoPanel
            seoTitle={seoTitle || title}
            seoDescription={seoDescription || shortDescription}
            slug={slug}
            contentHtml={contentHtml}
          />
        </div>
      </div>
    </div>
  );
};

// ── Small label wrapper ───────────────────────────────────────────────────────
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

export default AdminBlogEditor;
