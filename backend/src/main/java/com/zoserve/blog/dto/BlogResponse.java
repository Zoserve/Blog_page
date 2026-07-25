package com.zoserve.blog.dto;

import com.zoserve.blog.entity.Category;
import com.zoserve.blog.entity.Tag;
import java.time.LocalDateTime;
import java.util.Set;

public class BlogResponse {
    private Long id;
    private String title;
    private String slug;
    private String shortDescription;
    private String content;
    private Category category;
    private Set<Tag> tags;
    private String heroImage;
    private Boolean isPublished;
    private Integer views;
    private Integer readingTime;
    private AuthorDto author;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // SEO properties
    private String seoTitle;
    private String seoDescription;
    private String metaKeywords;
    private String ogImage;
    private String canonicalUrl;

    // JSON schemas
    private String faqSchema;
    private String breadcrumbSchema;
    private String articleSchema;

    // Constructors
    public BlogResponse() {}

    public BlogResponse(Long id, String title, String slug, String shortDescription, String content, Category category,
                        Set<Tag> tags, String heroImage, Boolean isPublished, Integer views, Integer readingTime,
                        AuthorDto author, LocalDateTime publishedAt, LocalDateTime createdAt, LocalDateTime updatedAt,
                        String seoTitle, String seoDescription, String metaKeywords, String ogImage, String canonicalUrl,
                        String faqSchema, String breadcrumbSchema, String articleSchema) {
        this.id = id;
        this.title = title;
        this.slug = slug;
        this.shortDescription = shortDescription;
        this.content = content;
        this.category = category;
        this.tags = tags;
        this.heroImage = heroImage;
        this.isPublished = isPublished;
        this.views = views;
        this.readingTime = readingTime;
        this.author = author;
        this.publishedAt = publishedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.seoTitle = seoTitle;
        this.seoDescription = seoDescription;
        this.metaKeywords = metaKeywords;
        this.ogImage = ogImage;
        this.canonicalUrl = canonicalUrl;
        this.faqSchema = faqSchema;
        this.breadcrumbSchema = breadcrumbSchema;
        this.articleSchema = articleSchema;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public Set<Tag> getTags() { return tags; }
    public void setTags(Set<Tag> tags) { this.tags = tags; }

    public String getHeroImage() { return heroImage; }
    public void setHeroImage(String heroImage) { this.heroImage = heroImage; }

    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }

    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }

    public Integer getReadingTime() { return readingTime; }
    public void setReadingTime(Integer readingTime) { this.readingTime = readingTime; }

    public AuthorDto getAuthor() { return author; }
    public void setAuthor(AuthorDto author) { this.author = author; }

    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getSeoTitle() { return seoTitle; }
    public void setSeoTitle(String seoTitle) { this.seoTitle = seoTitle; }

    public String getSeoDescription() { return seoDescription; }
    public void setSeoDescription(String seoDescription) { this.seoDescription = seoDescription; }

    public String getMetaKeywords() { return metaKeywords; }
    public void setMetaKeywords(String metaKeywords) { this.metaKeywords = metaKeywords; }

    public String getOgImage() { return ogImage; }
    public void setOgImage(String ogImage) { this.ogImage = ogImage; }

    public String getCanonicalUrl() { return canonicalUrl; }
    public void setCanonicalUrl(String canonicalUrl) { this.canonicalUrl = canonicalUrl; }

    public String getFaqSchema() { return faqSchema; }
    public void setFaqSchema(String faqSchema) { this.faqSchema = faqSchema; }

    public String getBreadcrumbSchema() { return breadcrumbSchema; }
    public void setBreadcrumbSchema(String breadcrumbSchema) { this.breadcrumbSchema = breadcrumbSchema; }

    public String getArticleSchema() { return articleSchema; }
    public void setArticleSchema(String articleSchema) { this.articleSchema = articleSchema; }

    // Static Builder
    public static BlogResponseBuilder builder() {
        return new BlogResponseBuilder();
    }

    public static class BlogResponseBuilder {
        private Long id;
        private String title;
        private String slug;
        private String shortDescription;
        private String content;
        private Category category;
        private Set<Tag> tags;
        private String heroImage;
        private Boolean isPublished;
        private Integer views;
        private Integer readingTime;
        private AuthorDto author;
        private LocalDateTime publishedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String seoTitle;
        private String seoDescription;
        private String metaKeywords;
        private String ogImage;
        private String canonicalUrl;
        private String faqSchema;
        private String breadcrumbSchema;
        private String articleSchema;

        public BlogResponseBuilder id(Long id) { this.id = id; return this; }
        public BlogResponseBuilder title(String title) { this.title = title; return this; }
        public BlogResponseBuilder slug(String slug) { this.slug = slug; return this; }
        public BlogResponseBuilder shortDescription(String shortDescription) { this.shortDescription = shortDescription; return this; }
        public BlogResponseBuilder content(String content) { this.content = content; return this; }
        public BlogResponseBuilder category(Category category) { this.category = category; return this; }
        public BlogResponseBuilder tags(Set<Tag> tags) { this.tags = tags; return this; }
        public BlogResponseBuilder heroImage(String heroImage) { this.heroImage = heroImage; return this; }
        public BlogResponseBuilder isPublished(Boolean isPublished) { this.isPublished = isPublished; return this; }
        public BlogResponseBuilder views(Integer views) { this.views = views; return this; }
        public BlogResponseBuilder readingTime(Integer readingTime) { this.readingTime = readingTime; return this; }
        public BlogResponseBuilder author(AuthorDto author) { this.author = author; return this; }
        public BlogResponseBuilder publishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; return this; }
        public BlogResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public BlogResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public BlogResponseBuilder seoTitle(String seoTitle) { this.seoTitle = seoTitle; return this; }
        public BlogResponseBuilder seoDescription(String seoDescription) { this.seoDescription = seoDescription; return this; }
        public BlogResponseBuilder metaKeywords(String metaKeywords) { this.metaKeywords = metaKeywords; return this; }
        public BlogResponseBuilder ogImage(String ogImage) { this.ogImage = ogImage; return this; }
        public BlogResponseBuilder canonicalUrl(String canonicalUrl) { this.canonicalUrl = canonicalUrl; return this; }
        public BlogResponseBuilder faqSchema(String faqSchema) { this.faqSchema = faqSchema; return this; }
        public BlogResponseBuilder breadcrumbSchema(String breadcrumbSchema) { this.breadcrumbSchema = breadcrumbSchema; return this; }
        public BlogResponseBuilder articleSchema(String articleSchema) { this.articleSchema = articleSchema; return this; }

        public BlogResponse build() {
            return new BlogResponse(id, title, slug, shortDescription, content, category, tags, heroImage, isPublished,
                    views, readingTime, author, publishedAt, createdAt, updatedAt, seoTitle, seoDescription,
                    metaKeywords, ogImage, canonicalUrl, faqSchema, breadcrumbSchema, articleSchema);
        }
    }
}
