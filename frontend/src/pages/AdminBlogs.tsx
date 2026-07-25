import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Copy, Filter, ChevronLeft, ChevronRight, Eye, RefreshCw, CheckSquare, Square } from 'lucide-react';
import api from '../services/api';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Blog {
  id: number;
  title: string;
  slug: string;
  category: Category;
  isPublished: boolean;
  views: number;
  createdAt: string;
}

const AdminBlogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filtering & Pagination State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [category, setCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [direction, setDirection] = useState('DESC');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Bulk Operations State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const isPublishedParam = status === 'PUBLISHED' ? true : status === 'DRAFT' ? false : null;
      const categoryParam = category === 'ALL' ? null : category;
      const searchParam = search.trim() || null;

      const res = await api.get('/admin/blogs', {
        params: {
          search: searchParam,
          isPublished: isPublishedParam,
          category: categoryParam,
          page,
          size: 10,
          sortBy,
          direction,
        },
      });

      setBlogs(res.data.content);
      setTotalPages(res.data.totalPages);
      setSelectedIds([]); // Clear selection on load
    } catch (err) {
      alert('Failed to fetch articles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [page, status, category, sortBy, direction]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchBlogs();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      await api.delete(`/admin/blogs/${id}`);
      fetchBlogs();
    } catch (err) {
      alert('Failed to delete blog');
      console.error(err);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await api.post(`/admin/blogs/${id}/duplicate`);
      fetchBlogs();
    } catch (err) {
      alert('Failed to duplicate blog');
      console.error(err);
    }
  };

  // Bulk operation helpers
  const handleSelectToggle = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === blogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(blogs.map((b) => b.id));
    }
  };

  const handleBulkPublish = async (publish: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      await api.post(`/admin/blogs/bulk-publish?publish=${publish}`, selectedIds);
      fetchBlogs();
    } catch (err) {
      alert('Failed to perform bulk publish');
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected articles?`)) return;

    try {
      await api.post('/admin/blogs/bulk-delete', selectedIds);
      fetchBlogs();
    } catch (err) {
      alert('Failed to perform bulk delete');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Blogs Manager</h2>
          <p className="text-xs text-slate-400 mt-1">Publish, edit, duplicate, and search articles.</p>
        </div>
        <Link
          to="/blog/admin/create"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Article</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-premium flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search form */}
        <form onSubmit={handleSearchSubmit} className="flex relative items-center max-w-md w-full">
          <input
            type="text"
            placeholder="Search title, description or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] focus:ring-2 focus:ring-slate-100 transition-all text-xs placeholder:text-slate-400"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <button
            type="submit"
            className="absolute right-2 px-3 py-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-[10px] font-bold rounded-lg cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--color-primary-light)] cursor-pointer font-medium"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Drafts</option>
            </select>
          </div>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(0); }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--color-primary-light)] cursor-pointer font-medium"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>

          <select
            value={`${sortBy}-${direction}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split('-');
              setSortBy(field);
              setDirection(dir);
              setPage(0);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--color-primary-light)] cursor-pointer font-medium"
          >
            <option value="createdAt-DESC">Newest First</option>
            <option value="createdAt-ASC">Oldest First</option>
            <option value="views-DESC">Most Viewed</option>
          </select>

          <button
            onClick={fetchBlogs}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bulk Operations Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-[var(--color-primary-light)]/10 border border-[var(--color-primary-light)]/20 px-6 py-3.5 rounded-2xl flex items-center justify-between text-xs text-[var(--color-primary)] font-semibold shadow-sm">
          <span>{selectedIds.length} articles selected</span>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleBulkPublish(true)}
              className="px-3.5 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg transition-colors cursor-pointer"
            >
              Publish Selected
            </button>
            <button
              onClick={() => handleBulkPublish(false)}
              className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
            >
              Draft Selected
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Blogs Table Grid */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-premium overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-[var(--color-primary-light)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No articles match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-4 px-6 w-10">
                    <button onClick={handleSelectAll} className="text-slate-400 hover:text-slate-600">
                      {selectedIds.length === blogs.length ? (
                        <CheckSquare className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                      ) : (
                        <Square className="w-4.5 h-4.5" />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Article Title</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Category</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Status</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Views</th>
                  <th className="py-4 px-4 font-semibold text-slate-600">Created Date</th>
                  <th className="py-4 px-6 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {blogs.map((blog) => {
                  const isChecked = selectedIds.includes(blog.id);
                  return (
                    <tr key={blog.id} className={`hover:bg-slate-50/50 transition-colors ${isChecked ? 'bg-blue-50/20' : ''}`}>
                      <td className="py-4 px-6">
                        <button onClick={() => handleSelectToggle(blog.id)} className="text-slate-400 hover:text-slate-600">
                          {isChecked ? (
                            <CheckSquare className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                          ) : (
                            <Square className="w-4.5 h-4.5" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800 max-w-sm truncate">
                        <Link to={`/blog/${blog.slug}`} className="hover:text-[var(--color-primary-light)]">
                          {blog.title}
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded">
                          {blog.category.name}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          blog.isPublished
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {blog.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-medium flex items-center space-x-1 mt-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{blog.views}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-medium">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/blog/admin/edit/${blog.id}`}
                            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDuplicate(blog.id)}
                            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(blog.id)}
                            className="p-1.5 border border-red-100 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination footer */}
        {!loading && blogs.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogs;
