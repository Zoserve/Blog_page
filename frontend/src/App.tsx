import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import BlogDetails from './pages/BlogDetails';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminBlogs from './pages/AdminBlogs';
import AdminBlogEditor from './pages/AdminBlogEditor';
import AdminMedia from './pages/AdminMedia';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<Navigate to="/blog" replace />} />
          <Route path="/login" element={<Navigate to="/blog/login" replace />} />
          
          <Route path="/blog" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path=":slug" element={<BlogDetails />} />
            <Route path="login" element={<Login />} />
          </Route>

          {/* Secure Admin Dashboard Routes */}
          <Route path="/blog/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="create" element={<AdminBlogEditor />} />
            <Route path="edit/:id" element={<AdminBlogEditor />} />
            <Route path="media" element={<AdminMedia />} />
          </Route>

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/blog" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
