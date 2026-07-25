import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, FileText, Image as ImageIcon, LogOut, ArrowLeft, User as UserIcon } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/blog/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-[var(--color-primary-light)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Prevents render flashing prior to navigation redirect
  }

  const navItems = [
    { label: 'Dashboard', path: '/blog/admin', icon: LayoutDashboard },
    { label: 'Blogs Manager', path: '/blog/admin/blogs', icon: FileText },
    { label: 'Media Library', path: '/blog/admin/media', icon: ImageIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/blog');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* Mobile Top Navbar (lg:hidden) */}
      <header className="lg:hidden w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm shrink-0">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link to="/blog" className="flex items-center space-x-2">
            <span className="font-bold text-sm text-[var(--color-text-main)] tracking-tight">ZoServe Admin</span>
          </Link>
          
          <div className="flex items-center space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/blog/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[var(--color-primary-light)]/10 text-[var(--color-primary)]'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4.5 h-4.5" />
                </Link>
              );
            })}
            <Link
              to="/blog"
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100"
              title="Back to Blog"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 1. Left Sidebar (Desktop only) */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200 bg-white flex-col shrink-0">
        {/* Top Header Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200/60 justify-between">
          <Link to="/blog" className="flex items-center space-x-2.5 group">
            <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none">
              <defs>
                <linearGradient id="adminBracketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1A3C6E" />
                  <stop offset="100%" stopColor="#24508F" />
                </linearGradient>
                <linearGradient id="adminRackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2ED47A" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#1A3C6E" />
                </linearGradient>
                <linearGradient id="adminNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2ED47A" />
                  <stop offset="100%" stopColor="#24508F" />
                </linearGradient>
              </defs>
              
              {/* Code Brackets */}
              <path d="M 36 24 L 18 50 L 36 76" stroke="url(#adminBracketGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 64 24 L 82 50 L 64 76" stroke="url(#adminBracketGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Server lines */}
              <path d="M 32 37 H 68" stroke="url(#adminRackGrad)" strokeWidth="8" strokeLinecap="round" />
              <path d="M 32 63 H 68" stroke="url(#adminRackGrad)" strokeWidth="8" strokeLinecap="round" />
              
              {/* Database Core node */}
              <circle cx="50" cy="50" r="8.5" fill="url(#adminNodeGrad)" />
            </svg>
            <span className="font-bold text-base text-[var(--color-text-main)] tracking-tight">ZoServe Admin</span>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-grow p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/blog/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--color-primary-light)]/10 text-[var(--color-primary)] shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200/60 space-y-1 bg-slate-50/50">
          <Link
            to="/blog"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-200/50 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Blog</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Right Content Section */}
      <div className="flex-grow flex flex-col min-h-screen overflow-hidden">
        {/* Top bar (Desktop only) */}
        <header className="hidden lg:flex h-16 border-b border-slate-200 bg-white items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {location.pathname === '/blog/admin' ? 'Overview' : location.pathname.includes('/media') ? 'Library' : 'Content Management'}
            </h1>
          </div>
          
          {/* User profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800 leading-none">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-slate-400 mt-1 leading-none uppercase font-medium">{user.role.replace('ROLE_', '')}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
              <UserIcon className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-grow p-4 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
