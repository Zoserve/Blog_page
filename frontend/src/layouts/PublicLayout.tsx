import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Rss, Globe, ExternalLink } from 'lucide-react';
import api from '../services/api';

interface Category {
  id: number;
  name: string;
  slug: string;
}

const PublicLayout: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const location = useLocation();

  const isLoginPage = location.pathname === '/blog/login' || location.pathname === '/login';

  useEffect(() => {
    // Load categories for footer and details mapping
    const fetchCategories = async () => {
      try {
        const res = await api.get('/public/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    try {
      await api.post('/public/newsletter/subscribe', { email: newsletterEmail });
      setNewsletterStatus({ type: 'success', message: 'Thanks for subscribing!' });
      setNewsletterEmail('');
    } catch (err: any) {
      const msg = err.response?.data || 'Failed to subscribe. Please try again.';
      setNewsletterStatus({ type: 'error', message: msg });
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-muted)' }}>
      {/* 1. Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border-light)] bg-white/75 backdrop-blur-md shadow-premium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/blog" className="flex items-center space-x-3.5 group">
            <svg className="w-8 h-8 transition-transform group-hover:scale-105 duration-300" viewBox="0 0 100 100" fill="none">
              <defs>
                <linearGradient id="codeBracketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1A3C6E" />
                  <stop offset="100%" stopColor="#24508F" />
                </linearGradient>
                <linearGradient id="serverRackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2ED47A" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#1A3C6E" />
                </linearGradient>
                <linearGradient id="coreNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2ED47A" />
                  <stop offset="100%" stopColor="#24508F" />
                </linearGradient>
              </defs>
              
              {/* Code Brackets */}
              <path d="M 36 24 L 18 50 L 36 76" stroke="url(#codeBracketGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 64 24 L 82 50 L 64 76" stroke="url(#codeBracketGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Server lines */}
              <path d="M 32 37 H 68" stroke="url(#serverRackGrad)" strokeWidth="8" strokeLinecap="round" />
              <path d="M 32 63 H 68" stroke="url(#serverRackGrad)" strokeWidth="8" strokeLinecap="round" />
              
              {/* Database Core node */}
              <circle cx="50" cy="50" r="8.5" fill="url(#coreNodeGrad)" />
            </svg>
            <span className="font-bold text-lg tracking-tight text-[var(--color-text-main)] flex items-center">
              ZoServe
              <span className="ml-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-[var(--color-primary-dark)] text-[var(--color-accent)] shadow-sm">
                Blog
              </span>
            </span>
          </Link>

          {/* Main Website Link (Right side) */}
          <a
            href="https://zoserve.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-[var(--color-border-light)] hover:border-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)]/5 text-[var(--color-primary-light)] hover:text-[var(--color-primary)] font-bold text-xs transition-all duration-200"
          >
            <span>zoserve.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* 2. Main content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* 3. Footer with Newsletter Subscription */}
      {!isLoginPage && (
        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
          {/* Newsletter Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-slate-800">
            <div className="lg:col-span-2">
              <h3 className="text-white text-lg font-semibold mb-2">Subscribe to our newsletter</h3>
              <p className="text-sm text-slate-400 max-w-md">Get the latest insights on software engineering, cloud architecture, and artificial intelligence delivered straight to your inbox.</p>
            </div>
            <div>
              <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="px-4 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] text-sm flex-grow placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-slate-950 text-sm font-bold rounded-xl flex items-center justify-center space-x-1 transition-colors shadow-lg shadow-emerald-500/10 shrink-0 cursor-pointer"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </form>
              {newsletterStatus.type && (
                <p className={`text-xs mt-2 ${newsletterStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {newsletterStatus.message}
                </p>
              )}
            </div>
          </div>

          {/* Links and Credits */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                {categories.slice(0, 4).map((cat) => (
                  <li key={cat.id}>
                    <Link to={`/blog?category=${cat.slug}`} className="hover:text-white transition-colors">{cat.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://zoserve.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">About ZoServe</a></li>
                <li><a href="https://zoserve.com#services" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Our Services</a></li>
                <li><a href="https://zoserve.com#contact" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">SEO Feeds</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="http://localhost:9090/api/v1/public/rss.xml" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:text-white transition-colors">
                    <Rss className="w-3.5 h-3.5 text-orange-500" />
                    <span>RSS Feed</span>
                  </a>
                </li>
                <li>
                  <a href="http://localhost:9090/api/v1/public/sitemap.xml" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:text-white transition-colors">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span>Sitemap.xml</span>
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Contact Info</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                ZoServe Technology Solutions<br />
                Email: contact@zoserve.com<br />
                Web: zoserve.com
              </p>
            </div>
          </div>

          {/* Legal copyrights */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>&copy; {new Date().getFullYear()} ZoServe. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="https://zoserve.com/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="https://zoserve.com/terms" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PublicLayout;
