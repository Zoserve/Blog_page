import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, CheckCircle, Edit, Plus, Folder, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

interface Blog {
  id: number;
  title: string;
  slug: string;
  category: { name: string };
  isPublished: boolean;
  views: number;
  createdAt: string;
}

interface Stats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  totalCategories: number;
  totalViews: number;
  recentBlogs: Blog[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/analytics/stats');
        setStats(res.data);
      } catch (err) {
        setError('Failed to fetch dashboard stats. Ensure the backend is online.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[var(--color-primary-light)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 rounded-2xl border flex items-center space-x-3 text-xs" style={{ backgroundColor: 'var(--color-alert-bg)', borderColor: 'var(--color-alert-border)', color: 'var(--color-alert-text)' }}>
        <AlertCircle className="w-5 h-5 shrink-0" style={{ color: 'var(--color-alert-text)' }} />
        <span>{error || 'No statistics data available'}</span>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Blogs', value: stats.totalBlogs, icon: FileText, color: 'bg-[var(--color-primary)] text-white' },
    { label: 'Published Blogs', value: stats.publishedBlogs, icon: CheckCircle, color: 'bg-[var(--color-accent)] text-slate-950' },
    { label: 'Draft Blogs', value: stats.draftBlogs, icon: Edit, color: 'bg-amber-500 text-white' },
    { label: 'Categories', value: stats.totalCategories, icon: Folder, color: 'bg-[var(--color-primary-light)] text-white' },
    { label: 'Total Read Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'bg-emerald-500 text-white' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Overview Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">Here is a snapshot of your corporate blog analytics and activity.</p>
        </div>
        <Link
          to="/blog/admin/create"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-[var(--color-primary)]/10 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Blog</span>
        </Link>
      </div>

      {/* 2. KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={kpi.label}
              className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-premium flex items-center space-x-4"
            >
              <div className={`p-3 rounded-xl text-white ${kpi.color} shadow-sm shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{kpi.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Recent Blogs list */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-premium overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200/60 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Recently Modified Articles</h3>
          <Link to="/blog/admin/blogs" className="text-xs font-semibold text-[var(--color-primary-light)] hover:text-[var(--color-primary)]">
            View all articles →
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recentBlogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No articles created yet. Get started by clicking "Create New Blog".
            </div>
          ) : (
            stats.recentBlogs.map((blog) => (
              <div key={blog.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <Link to={`/blog/${blog.slug}`} className="font-semibold text-slate-800 hover:text-[var(--color-primary-light)] transition-colors block">
                    {blog.title}
                  </Link>
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-medium">{blog.category.name}</span>
                    <span>•</span>
                    <span>Modified: {new Date(blog.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{blog.views}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
                    blog.isPublished
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {blog.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <Link
                    to={`/blog/admin/edit/${blog.id}`}
                    className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                    title="Edit blog"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
