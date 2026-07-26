import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, BookOpen, Clock, Calendar, ChevronRight, Eye, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';
import api, { formatImageUrl } from '../services/api';
import SEO from '../components/SEO';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Blog {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  heroImage: string;
  views: number;
  readingTime: number;
  publishedAt: string;
  category: Category;
  author: { firstName: string; lastName: string };
}

const Home: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [trending, setTrending] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(searchParam);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync search query input
    setSearchQuery(searchParam);
    setPage(0); // Reset page on filter change
  }, [searchParam, categoryParam]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/public/categories');
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();

    const fetchTrending = async () => {
      try {
        const res = await api.get('/public/blogs/trending');
        setTrending(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/public/blogs', {
          params: {
            category: categoryParam || null,
            search: searchParam || null,
            page,
            size: 6,
            sortBy: 'publishedAt',
            direction: 'DESC'
          }
        });
        setBlogs(res.data.content);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [page, categoryParam, searchParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim(), ...(categoryParam ? { category: categoryParam } : {}) });
    } else {
      const params: any = {};
      if (categoryParam) params.category = categoryParam;
      setSearchParams(params);
    }
  };

  const handleCategorySelect = (slug: string) => {
    if (categoryParam === slug) {
      // Toggle off
      const params: any = {};
      if (searchParam) params.search = searchParam;
      setSearchParams(params);
    } else {
      setSearchParams({ category: slug, ...(searchParam ? { search: searchParam } : {}) });
    }
  };

  // Split featured blog from list
  const featuredBlog = page === 0 && !searchParam && blogs.length > 0 ? blogs[0] : null;
  const latestBlogs = featuredBlog ? blogs.slice(1) : blogs;

  return (
    <div className="relative pb-16">
      <SEO 
        title={categoryParam ? `${categories.find(c => c.slug === categoryParam)?.name} Articles` : 'Tech Insights & Guides'} 
        description="Read articles on Software Engineering, Web Development, Cloud Computing, UI/UX, and AI from ZoServe's engineering team." 
      />

      {/* Decorative backdrop glow */}
      <div className="absolute top-0 inset-x-0 h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-60 left-1/3 w-[600px] h-[600px] rounded-full bg-[var(--color-primary-light)]/5 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full bg-[var(--color-accent)]/5 blur-[100px]"></div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest bg-[var(--color-primary-light)]/10 text-[var(--color-primary-light)] border border-[var(--color-border-accent)] uppercase">
            ZoServe Technology Journal
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[var(--color-text-main)] leading-[1.15]">
            Perspective on Engineering. <br />
            <span className="text-[var(--color-accent)] block mt-2">Done Right.</span>
          </h1>
          <p className="text-sm md:text-base text-[var(--color-text-muted)] font-medium max-w-xl mx-auto leading-relaxed">
            Deep dives, tutorials, and strategic insights from our senior full stack architects and product designers.
          </p>
        </motion.div>
      </section>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/60 pb-6">
          {/* Categories Horizontal scroll tags */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth flex-grow">
            <button
              onClick={() => setSearchParams(searchParam ? { search: searchParam } : {})}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide shrink-0 transition-all ${
                !categoryParam
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-800'
              }`}
            >
              All Articles
            </button>
            {categories.map((cat) => {
              const isSelected = categoryParam === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-white shadow-sm shadow-[var(--color-primary)]/10'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-800'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Home Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex relative items-center max-w-xs w-full shrink-0">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] focus:ring-2 focus:ring-slate-100 transition-all text-xs text-slate-700 placeholder:text-slate-400"
            />
            <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
          </form>
        </div>
      </section>

      {/* 3. MAIN BLOGS CONTENT GRID */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-[var(--color-primary-light)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="py-24 text-center bg-white border border-slate-200 rounded-2xl p-8 text-slate-400 max-w-xl mx-auto shadow-premium">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium">No articles matched your search filter criteria. Try adjusting keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left/Middle Column (Blogs Listing) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* FEATURED CARD */}
              {featuredBlog && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300 group"
                >
                  <Link to={`/blog/${featuredBlog.slug}`} className="block aspect-[21/9] w-full bg-slate-100 relative overflow-hidden">
                    <img
                      src={featuredBlog.heroImage ? formatImageUrl(featuredBlog.heroImage) : 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800'}
                      alt={featuredBlog.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800';
                      }}
                    />
                  </Link>
                  <div className="p-8 space-y-4">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-[var(--color-primary-light)] uppercase tracking-wide">
                      <span>Featured Article</span>
                      <span>•</span>
                      <span className="bg-[var(--color-primary-light)]/10 px-2 py-0.5 rounded text-[var(--color-primary)]">{featuredBlog.category.name}</span>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-main)] group-hover:text-[var(--color-primary-light)] transition-colors tracking-tight">
                      <Link to={`/blog/${featuredBlog.slug}`}>{featuredBlog.title}</Link>
                    </h2>
                    
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed font-medium">
                      {featuredBlog.shortDescription}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{featuredBlog.author.firstName} {featuredBlog.author.lastName}</p>
                          <p className="font-medium text-[10px] mt-0.5 flex items-center space-x-2">
                            <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{new Date(featuredBlog.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{featuredBlog.readingTime} min read</span>
                          </p>
                        </div>
                      </div>
                      
                      <Link to={`/blog/${featuredBlog.slug}`} className="inline-flex items-center space-x-1.5 font-bold text-[var(--color-primary-light)] hover:text-[var(--color-primary)]">
                        <span>Read Full Post</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* LATEST CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {latestBlogs.map((blog, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={blog.id}
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col group h-full"
                  >
                    <Link to={`/blog/${blog.slug}`} className="aspect-[16/10] w-full bg-slate-100 relative overflow-hidden block">
                      <img
                        src={blog.heroImage ? formatImageUrl(blog.heroImage) : 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400'}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400';
                        }}
                      />
                    </Link>
                    
                    <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="inline-block bg-[var(--color-primary-light)]/10 text-[var(--color-primary)] font-semibold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                          {blog.category.name}
                        </span>
                        <h3 className="font-extrabold text-lg text-[var(--color-text-main)] group-hover:text-[var(--color-primary-light)] transition-colors tracking-tight line-clamp-2">
                          <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed font-medium line-clamp-3">
                          {blog.shortDescription}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                        <div className="flex items-center space-x-1.5">
                          <span className="flex items-center"><Calendar className="w-3 h-3 mr-0.5" />{new Date(blog.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          <span>•</span>
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-0.5" />{blog.readingTime} min</span>
                        </div>
                        <span className="font-bold text-slate-700">{blog.author.firstName} {blog.author.lastName}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* PAGINATION ROW */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 text-xs font-semibold text-slate-500">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  >
                    ← Previous Page
                  </button>
                  <span>Page {page + 1} of {totalPages}</span>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  >
                    Next Page →
                  </button>
                </div>
              )}
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-8 lg:sticky lg:top-24">
              
              {/* Lead generation CTA */}
              <div className="bg-gradient-to-br from-slate-900 to-[var(--color-primary-dark)] p-6 rounded-2xl text-white shadow-lg space-y-4 border border-slate-800">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--color-accent)]">Collaborate With Us</span>
                <h4 className="text-xl font-extrabold tracking-tight">Need custom software or mobile apps?</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  ZoServe designs and deploys secure enterprise platforms, AI applications, and premium mobile codebases.
                </p>
                <a
                  href="https://zoserve.com#contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl text-center text-xs font-semibold transition-colors flex items-center justify-center space-x-1 shadow-md shadow-[var(--color-primary)]/10 cursor-pointer"
                >
                  <span>Get Free Quote</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Trending/Popular articles */}
              {trending.length > 0 && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
                    <span>Trending Articles</span>
                  </h3>
                  <div className="divide-y divide-slate-100">
                    {trending.map((blog, idx) => (
                      <div key={blog.id} className="py-3.5 first:pt-0 last:pb-0 flex space-x-3.5 items-start">
                        <span className="text-2xl font-bold text-slate-200 leading-none">{idx + 1}</span>
                        <div className="space-y-1">
                          <Link to={`/blog/${blog.slug}`} className="font-bold text-xs text-[var(--color-text-main)] hover:text-[var(--color-primary-light)] transition-colors line-clamp-2 leading-snug">
                            {blog.title}
                          </Link>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium">
                            <span className="text-[var(--color-primary-light)] font-semibold">{blog.category.name}</span>
                            <span>•</span>
                            <span className="flex items-center"><Eye className="w-3 h-3 mr-0.5" /> {blog.views}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
