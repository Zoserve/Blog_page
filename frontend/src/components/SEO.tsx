import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  faqSchema?: string | null;
  breadcrumbSchema?: string | null;
  articleSchema?: string | null;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogImage,
  canonicalUrl,
  faqSchema,
  breadcrumbSchema,
  articleSchema,
}) => {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title ? `${title} | ZoServe Blog` : 'ZoServe Blog | Tech Insights & Software Architecture';
    document.title = formattedTitle;

    // Helper to create or update meta elements
    const setMetaTag = (attr: string, value: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${value}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, value);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to create or update links
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Helper to inject JSON-LD schemas
    const setSchemaTag = (id: string, schemaString: string | null | undefined) => {
      let element = document.getElementById(id);
      if (element) {
        element.remove();
      }
      if (schemaString) {
        const script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('id', id);
        script.textContent = schemaString;
        document.head.appendChild(script);
      }
    };

    // 2. Base Meta Tags
    if (description) {
      setMetaTag('name', 'description', description);
    }
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }

    // 3. Open Graph Tags
    setMetaTag('property', 'og:title', title || 'ZoServe Blog');
    if (description) {
      setMetaTag('property', 'og:description', description);
    }
    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage);
    }
    setMetaTag('property', 'og:url', canonicalUrl || window.location.href);
    setMetaTag('property', 'og:type', 'article');

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title || 'ZoServe Blog');
    if (description) {
      setMetaTag('name', 'twitter:description', description);
    }
    if (ogImage) {
      setMetaTag('name', 'twitter:image', ogImage);
    }

    // 5. Canonical Link
    // Strip transient params (search, page) that produce duplicate-content variants.
    // We intentionally KEEP ?category= so category-filtered pages are indexed separately.
    if (canonicalUrl) {
      setLinkTag('canonical', canonicalUrl);
    } else {
      const cleanCanonical = (() => {
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('search');
          url.searchParams.delete('page');
          return url.toString();
        } catch {
          return window.location.href;
        }
      })();
      setLinkTag('canonical', cleanCanonical);
    }

    // 6. JSON-LD Schemas
    setSchemaTag('seo-faq-schema', faqSchema);
    setSchemaTag('seo-breadcrumb-schema', breadcrumbSchema);
    setSchemaTag('seo-article-schema', articleSchema);

    // Cleanup scripts when component unmounts
    return () => {
      const faqScript = document.getElementById('seo-faq-schema');
      const breadcrumbScript = document.getElementById('seo-breadcrumb-schema');
      const articleScript = document.getElementById('seo-article-schema');
      if (faqScript) faqScript.remove();
      if (breadcrumbScript) breadcrumbScript.remove();
      if (articleScript) articleScript.remove();
    };
  }, [title, description, keywords, ogImage, canonicalUrl, faqSchema, breadcrumbSchema, articleSchema]);

  return null; // SEO is a side-effect only component
};

export default SEO;
