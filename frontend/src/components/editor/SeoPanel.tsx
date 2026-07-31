import React, { useMemo } from 'react';

interface Props {
  seoTitle: string;
  seoDescription: string;
  slug: string;
  contentHtml: string; // raw TipTap HTML for content analysis
  baseUrl?: string;
}

// ── Character-count color helper ─────────────────────────────────────────────
function titleColor(len: number): string {
  if (len === 0) return 'text-slate-400';
  if (len >= 30 && len <= 60) return 'text-emerald-600';
  if ((len > 0 && len < 30) || (len > 60 && len <= 70)) return 'text-amber-500';
  return 'text-red-500';
}

function descColor(len: number): string {
  if (len === 0) return 'text-slate-400';
  if (len >= 120 && len <= 156) return 'text-emerald-600';
  if ((len > 0 && len < 120) || (len > 156 && len <= 170)) return 'text-amber-500';
  return 'text-red-500';
}

function titleBg(len: number): string {
  if (len === 0) return 'bg-slate-200';
  if (len >= 30 && len <= 60) return 'bg-emerald-400';
  if ((len > 0 && len < 30) || (len > 60 && len <= 70)) return 'bg-amber-400';
  return 'bg-red-400';
}

function descBg(len: number): string {
  if (len === 0) return 'bg-slate-200';
  if (len >= 120 && len <= 156) return 'bg-emerald-400';
  if ((len > 0 && len < 120) || (len > 156 && len <= 170)) return 'bg-amber-400';
  return 'bg-red-400';
}

// ── Content analysis ─────────────────────────────────────────────────────────
function analyzeContent(html: string) {
  if (!html) return { wordCount: 0, readingTime: 0, hasH2: false };
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text ? text.split(' ').length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // avg 200 wpm
  const hasH2 = /<h[123]/i.test(html);
  return { wordCount, readingTime, hasH2 };
}

const SeoPanel: React.FC<Props> = ({
  seoTitle,
  seoDescription,
  slug,
  contentHtml,
  baseUrl = 'zoserve.com',
}) => {
  const titleLen = seoTitle.length;
  const descLen = seoDescription.length;
  const fullUrl = `${baseUrl}/blog/${slug || 'your-post-slug'}`;

  const { wordCount, readingTime, hasH2 } = useMemo(
    () => analyzeContent(contentHtml),
    [contentHtml]
  );

  // Truncate description preview to 156 chars
  const descPreview =
    seoDescription.length > 156
      ? seoDescription.slice(0, 153) + '...'
      : seoDescription || 'Add a meta description to see your Google preview...';

  const titlePreview =
    seoTitle.length > 60
      ? seoTitle.slice(0, 57) + '...'
      : seoTitle || 'Page title will appear here';

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-premium space-y-5">
      <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
        SEO Preview
      </h3>

      {/* ── SEO Title counter ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            SEO Title
          </label>
          <span className={`text-[10px] font-bold tabular-nums ${titleColor(titleLen)}`}>
            {titleLen} / 60
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${titleBg(titleLen)}`}
            style={{ width: `${Math.min(100, (titleLen / 70) * 100)}%` }}
          />
        </div>
        <p className={`text-[9px] font-medium ${titleColor(titleLen)}`}>
          {titleLen === 0
            ? 'No title yet'
            : titleLen < 30
            ? 'Too short -- aim for 30-60 characters'
            : titleLen <= 60
            ? '✓ Ideal length'
            : titleLen <= 70
            ? 'Getting long -- consider trimming'
            : 'Too long -- Google will truncate this'}
        </p>
      </div>

      {/* ── Meta Description counter ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Meta Description
          </label>
          <span className={`text-[10px] font-bold tabular-nums ${descColor(descLen)}`}>
            {descLen} / 156
          </span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${descBg(descLen)}`}
            style={{ width: `${Math.min(100, (descLen / 170) * 100)}%` }}
          />
        </div>
        <p className={`text-[9px] font-medium ${descColor(descLen)}`}>
          {descLen === 0
            ? 'No description yet'
            : descLen < 120
            ? 'Too short -- aim for 120-156 characters'
            : descLen <= 156
            ? '✓ Ideal length'
            : descLen <= 170
            ? 'Slightly long -- trim for best results'
            : 'Too long -- Google will truncate this'}
        </p>
      </div>

      {/* ── Slug preview ── */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          URL Slug
        </label>
        <p className="text-[10px] font-mono text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2 break-all">
          {fullUrl}
        </p>
      </div>

      {/* ── Google SERP Preview ── */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Google Preview
        </label>
        <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-1 font-sans">
          {/* Title */}
          <p className="text-[15px] font-normal text-blue-700 leading-snug hover:underline cursor-pointer line-clamp-1">
            {titlePreview}
          </p>
          {/* URL */}
          <p className="text-[12px] text-emerald-700 font-normal">{fullUrl}</p>
          {/* Description */}
          <p className="text-[12px] text-slate-600 leading-snug line-clamp-2">
            {descPreview}
          </p>
        </div>
      </div>

      {/* ── Content checks ── */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Content Analysis
        </label>
        <div className="grid grid-cols-2 gap-2">
          <ContentStat label="Words" value={wordCount.toLocaleString()} />
          <ContentStat label="Read time" value={`~${readingTime} min`} />
        </div>
        <div
          className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-semibold ${
            hasH2
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-amber-50 text-amber-700 border border-amber-100'
          }`}
        >
          <span>{hasH2 ? '✓' : '!'}</span>
          <span>{hasH2 ? 'Has section headings (H1/H2/H3)' : 'No headings found -- add some'}</span>
        </div>
      </div>
    </div>
  );
};

const ContentStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
    <span className="text-sm font-bold text-slate-800">{value}</span>
    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
      {label}
    </span>
  </div>
);

export default SeoPanel;
