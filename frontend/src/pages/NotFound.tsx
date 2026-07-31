import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, SearchX } from 'lucide-react';

/**
 * NotFound — styled 404 page shown on the `*` wildcard route.
 * Replaces the old silent redirect to /blog so Google correctly
 * receives a 404 signal rather than treating it as a soft 404.
 */
const NotFound: React.FC = () => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      {/* Decorative ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-[var(--color-primary-light)]/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[var(--color-accent)]/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 text-center max-w-md mx-auto"
      >
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--color-primary-light)]/10 border border-[var(--color-border-accent)] mb-6">
          <SearchX className="w-9 h-9 text-[var(--color-primary-light)]" />
        </div>

        {/* Heading */}
        <h1 className="text-6xl font-extrabold text-[var(--color-primary)] tracking-tight mb-2">
          404
        </h1>
        <h2 className="text-xl font-bold text-[var(--color-text-main)] tracking-tight mb-3">
          Page Not Found
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-8">
          The article or page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Head back to the blog home to find what you need.
        </p>

        {/* CTA */}
        <Link
          to="/blog"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold rounded-xl shadow-lg shadow-[var(--color-primary)]/10 transition-all duration-200"
        >
          <Home className="w-4 h-4" />
          <span>Go to Blog Home</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
