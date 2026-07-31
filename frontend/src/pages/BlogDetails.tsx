import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Eye, Link as LinkIcon, MessageSquare, ChevronLeft, ChevronRight, User, AlertCircle, ArrowUpRight, HelpCircle, Check } from 'lucide-react';
import api, { formatImageUrl } from '../services/api';
import { parseMarkdownToHtml } from '../utils/markdown';
import SEO from '../components/SEO';

interface Category {
  name: string;
  slug: string;
}

interface Blog {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  heroImage: string;
  views: number;
  readingTime: number;
  publishedAt: string;
  category: Category;
  author: { firstName: string; lastName: string };
  seoTitle: string;
  seoDescription: string;
  metaKeywords: string;
  ogImage: string;
  canonicalUrl: string;
  faqSchema: string;
  breadcrumbSchema: string;
  articleSchema: string;
}

interface Comment {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
}

const BlogDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [related, setRelated] = useState<Blog[]>([]);
  
  // Navigation siblings
  const [nextPost, setNextPost] = useState<{ title: string; slug: string } | null>(null);
  const [prevPost, setPrevPost] = useState<{ title: string; slug: string } | null>(null);

  // Form comments
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentStatus, setCommentStatus] = useState('');

  // UI state
  const [headings, setHeadings] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true);
      setError('');
      try {
        // Normalize slug to lowercase so /blog/My-Post and /blog/my-post resolve identically
        const normalizedSlug = slug?.toLowerCase();
        const res = await api.get(`/public/blogs/${normalizedSlug}`);
        const currentBlog = res.data;
        setBlog(currentBlog);

        // Extract H2 headings for Table of Contents
        const headingRegex = /^##\s+(.*)$/gm;
        const list: string[] = [];
        let match;
        while ((match = headingRegex.exec(currentBlog.content)) !== null) {
          list.push(match[1]);
        }
        setHeadings(list);

        // Fetch comments
        const commentsRes = await api.get(`/public/blogs/${slug}/comments`);
        setComments(commentsRes.data);

        // Fetch related blogs
        const relatedRes = await api.get(`/public/blogs/${currentBlog.id}/related`);
        setRelated(relatedRes.data);

        // Load next and prev links from relative parameters
        // Since we embedded next/prev methods in BlogRepository, we fetch them using custom backend properties
        try {
          const publicBlogsRes = await api.get('/public/blogs', { params: { size: 100 } });
          const allBlogs: Blog[] = publicBlogsRes.data.content;
          const currentIndex = allBlogs.findIndex(b => b.id === currentBlog.id);
          if (currentIndex !== -1) {
            if (currentIndex > 0) {
              setNextPost({ title: allBlogs[currentIndex - 1].title, slug: allBlogs[currentIndex - 1].slug });
            } else {
              setNextPost(null);
            }
            if (currentIndex < allBlogs.length - 1) {
              setPrevPost({ title: allBlogs[currentIndex + 1].title, slug: allBlogs[currentIndex + 1].slug });
            } else {
              setPrevPost(null);
            }
          }
        } catch (siblingErr) {
          console.error('Failed to parse siblings list', siblingErr);
        }

      } catch (err: any) {
        setError('Article not found or offline');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchBlogData();
  }, [slug]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorEmail.trim() || !commentText.trim()) return;

    try {
      await api.post(`/public/blogs/${slug}/comments`, {
        authorName,
        authorEmail,
        content: commentText
      });
      
      setComments([res.data, ...comments]);
      setCommentText('');
      setCommentStatus('Your comment has been submitted and approved.');
      setTimeout(() => setCommentStatus(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to submit comment');
    }
  };

  const scrollToHeading = (text: string) => {
    const elements = Array.from(document.querySelectorAll('h2'));
    const target = elements.find(el => el.textContent === text);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Apply offset for header
      window.scrollBy(0, -80);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFaqList = () => {
    if (!blog?.faqSchema) return [];
    try {
      const parsed = JSON.parse(blog.faqSchema);
      return parsed.mainEntity.map((item: any) => ({
        question: item.name,
        answer: item.acceptedAnswer.text
      }));
    } catch (e) {
      return [];
    }
  };

  const faqs = getFaqList();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-[var(--color-primary-light)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[var(--color-text-main)]">Article Unavailable</h3>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">{error || 'Failed to retrieve blog article details.'}</p>
        <Link to="/blog" className="text-[var(--color-primary-light)] font-semibold hover:underline block mt-4">
          Return to Blog Home
        </Link>
      </div>
    );
  }

  return (
    <div className="relative pb-24">
      {/* Dynamic SEO Injector */}
      <SEO
        title={blog.seoTitle}
        description={blog.seoDescription}
        keywords={blog.metaKeywords}
        ogImage={blog.ogImage ? formatImageUrl(blog.ogImage) : undefined}
        canonicalUrl={blog.canonicalUrl}
        faqSchema={blog.faqSchema}
        breadcrumbSchema={blog.breadcrumbSchema}
        articleSchema={blog.articleSchema}
      />

      {/* Decorative backdrop glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/4 w-[400px] h-[400px] rounded-full bg-[var(--color-primary-light)]/5 blur-[100px]"></div>
      </div>

      {/* Hero Banner Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        {/* Breadcrumbs */}
        <nav className="text-xs font-semibold text-slate-400 flex items-center space-x-2 mb-6">
          <Link to="/blog" className="hover:text-slate-700">Home</Link>
          <span>/</span>
          <Link to={`/blog?category=${blog.category.slug}`} className="hover:text-slate-700">{blog.category.name}</Link>
          <span>/</span>
          <span className="text-slate-600 truncate max-w-[200px]">{blog.title}</span>
        </nav>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--color-text-main)] leading-tight">
          {blog.title}
        </h1>

        {/* Metadata info */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-slate-200 mt-6 text-slate-400 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="font-bold text-[var(--color-text-main)]">{blog.author.firstName} {blog.author.lastName}</p>
              <div className="flex items-center space-x-2 text-[10px] mt-0.5 font-medium">
                <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-0.5 text-slate-400" />{new Date(blog.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-0.5 text-slate-400" />{blog.readingTime} min read</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1"><Eye className="w-4 h-4" /><span>{blog.views} views</span></span>
            
            {/* Share controls */}
            <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-4">
              <button
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-center"
                title="Share on X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
              <button
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                className="p-1.5 text-slate-400 hover:text-blue-700 transition-colors flex items-center justify-center"
                title="Share on LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>
              </button>
              <button
                onClick={handleCopyLink}
                className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main image */}
      {blog.heroImage && (
        <div className="max-w-5xl mx-auto px-4 my-8 relative z-10">
          <img
            src={formatImageUrl(blog.heroImage)}
            alt={blog.title}
            loading="lazy"
            className="w-full rounded-2xl object-cover aspect-[21/9] shadow-md border border-slate-200/50"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200';
            }}
          />
        </div>
      )}

      {/* Article Body Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10 mt-8">
        
        {/* Left Sticky Sidebar: Table of Contents */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6 lg:sticky lg:top-24 max-h-[calc(100vh-10rem)] overflow-y-auto pr-4 select-none">
          {headings.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">On This Page</h4>
              <nav className="space-y-2 text-xs">
                {headings.map((heading) => (
                  <button
                    key={heading}
                    onClick={() => scrollToHeading(heading)}
                    className="block text-left text-slate-500 hover:text-[var(--color-primary-light)] transition-all font-medium py-1 leading-normal cursor-pointer"
                  >
                    {heading}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </aside>

        {/* Middle Columns: Article Body */}
        <div className="lg:col-span-2 space-y-12">
          {/* Main prose text */}
          <article 
            className="prose-custom max-w-none select-text select-all" 
            dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(blog.content) }} 
          />

          {/* Dynamic FAQ Accordion */}
          {faqs.length > 0 && (
            <div className="border-t border-slate-200 pt-8 space-y-4">
              <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-[var(--color-primary-light)]" />
                <span>Frequently Asked Questions</span>
              </h3>
              <div className="space-y-3">
                {faqs.map((faq: any, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-premium">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full text-left px-5 py-4 font-bold text-sm text-[var(--color-text-main)] flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openFaqIndex === idx ? 'rotate-90' : ''}`} />
                    </button>
                    {openFaqIndex === idx && (
                      <div className="px-5 py-4 border-t border-slate-100 text-xs text-[var(--color-text-muted)] leading-relaxed bg-slate-50/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sibling navigation footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-y border-slate-200 py-6 text-xs font-semibold text-slate-500">
            {prevPost ? (
              <Link to={`/blog/${prevPost.slug}`} className="flex flex-col items-start gap-1 p-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all sm:max-w-[45%]">
                <span className="text-[10px] text-slate-400 font-medium flex items-center"><ChevronLeft className="w-3.5 h-3.5" /><span>Previous Post</span></span>
                <span className="text-[var(--color-text-main)] line-clamp-1">{prevPost.title}</span>
              </Link>
            ) : <div />}

            {nextPost ? (
              <Link to={`/blog/${nextPost.slug}`} className="flex flex-col items-end gap-1 p-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all sm:max-w-[45%] text-right ml-auto">
                <span className="text-[10px] text-slate-400 font-medium flex items-center"><span>Next Post</span><ChevronRight className="w-3.5 h-3.5" /></span>
                <span className="text-[var(--color-text-main)] line-clamp-1">{nextPost.title}</span>
              </Link>
            ) : <div />}
          </div>

          {/* 8. Fully Functional Comment Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--color-text-main)] flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-[var(--color-primary-light)]" />
              <span>Discussion ({comments.length})</span>
            </h3>

            {/* Comment creation form */}
            <form onSubmit={handlePostComment} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-premium space-y-4">
              <h4 className="font-bold text-xs text-[var(--color-text-main)]">Leave a Reply</h4>
              
              {commentStatus && (
                <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl">
                  {commentStatus}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[var(--color-primary-light)] focus:ring-2 focus:ring-slate-100 transition-all text-[var(--color-text-main)]"
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email (will not be published)"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-[var(--color-primary-light)] focus:ring-2 focus:ring-slate-100 transition-all text-[var(--color-text-main)]"
                />
              </div>

              <textarea
                required
                rows={4}
                placeholder="Share your thoughts or questions..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed focus:outline-none focus:bg-white focus:border-[var(--color-primary-light)] focus:ring-2 focus:ring-slate-100 transition-all resize-none text-[var(--color-text-main)]"
              />

              <button
                type="submit"
                className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Submit Comment
              </button>
            </form>

            {/* List of comments */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No comments posted yet. Be the first to share your thoughts!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-[var(--color-text-light)] font-medium">
                      <span className="font-bold text-[var(--color-text-main)]">{comment.authorName}</span>
                      <span>{new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed pr-4 select-text">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar: ZoServe Lead Gen CTA */}
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 max-h-[calc(100vh-10rem)] overflow-y-auto">
          {/* Main CTA */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-premium space-y-5 border-t-2 border-t-[var(--color-primary)]">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--color-primary-light)]">Hire ZoServe</span>
            <h4 className="font-extrabold text-[var(--color-text-main)] text-base leading-snug tracking-tight">Accelerate your software roadmap</h4>
            <p className="text-[11px] text-[var(--color-text-light)] leading-relaxed font-medium">
              We specialize in custom web architectures, iOS/Android applications, and enterprise database engineering.
            </p>
            
            <div className="space-y-2.5 pt-2">
              <a
                href="https://zoserve.com#contact"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg text-center text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Get Free Quote</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="mailto:contact@zoserve.com?subject=Consultation%20Request"
                className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-center text-xs font-bold transition-colors flex items-center justify-center"
              >
                Book Consultation
              </a>
            </div>
          </div>

          {/* Related blogs list */}
          {related.length > 0 && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-premium space-y-4">
              <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-3 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Related Articles</span>
              </h3>
              <div className="space-y-4">
                {related.map((blogItem) => (
                  <div key={blogItem.id} className="space-y-1.5">
                    <Link to={`/blog/${blogItem.slug}`} className="font-bold text-xs text-[var(--color-text-main)] hover:text-[var(--color-primary-light)] transition-colors line-clamp-2 leading-snug">
                      {blogItem.title}
                    </Link>
                    <p className="text-[10px] text-[var(--color-text-light)] font-medium">
                      {blogItem.readingTime} min read • {new Date(blogItem.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default BlogDetails;
