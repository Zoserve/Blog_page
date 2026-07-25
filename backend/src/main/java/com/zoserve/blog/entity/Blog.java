package com.zoserve.blog.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "blogs")
public class Blog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "short_description", nullable = false, columnDefinition = "TEXT")
    private String shortDescription;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "hero_image")
    private String heroImage;

    @Column(name = "is_published")
    private Boolean isPublished = false;

    @Column(nullable = false)
    private Integer views = 0;

    @Column(name = "reading_time", nullable = false)
    private Integer readingTime = 1;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "blog_tags",
        joinColumns = @JoinColumn(name = "blog_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // SEO properties
    @Column(name = "seo_title")
    private String seoTitle;

    @Column(name = "seo_description", length = 500)
    private String seoDescription;

    @Column(name = "meta_keywords", length = 500)
    private String metaKeywords;

    @Column(name = "og_image")
    private String ogImage;

    @Column(name = "canonical_url")
    private String canonicalUrl;

    // JSON schemas
    @Lob
    @Column(name = "faq_schema", columnDefinition = "LONGTEXT")
    private String faqSchema;

    @Lob
    @Column(name = "breadcrumb_schema", columnDefinition = "LONGTEXT")
    private String breadcrumbSchema;

    @Lob
    @Column(name = "article_schema", columnDefinition = "LONGTEXT")
    private String articleSchema;

    // Constructors
    public Blog() {}

    public Blog(Long id, String title, String slug, String shortDescription, String content, Category category,
                String heroImage, Boolean isPublished, Integer views, Integer readingTime, User author, Set<Tag> tags,
                LocalDateTime publishedAt, LocalDateTime createdAt, LocalDateTime updatedAt, String seoTitle,
                String seoDescription, String metaKeywords, String ogImage, String canonicalUrl, String faqSchema,
                String breadcrumbSchema, String articleSchema) {
        this.id = id;
        this.title = title;
        this.slug = slug;
        this.shortDescription = shortDescription;
        this.content = content;
        this.category = category;
        this.heroImage = heroImage;
        this.isPublished = isPublished != null ? isPublished : false;
        this.views = views != null ? views : 0;
        this.readingTime = readingTime != null ? readingTime : 1;
        this.author = author;
        this.tags = tags != null ? tags : new HashSet<>();
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

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (views == null) views = 0;
        if (readingTime == null) readingTime = 1;
        if (isPublished == null) isPublished = false;
        if (tags == null) tags = new HashSet<>();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
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

    public String getHeroImage() { return heroImage; }
    public void setHeroImage(String heroImage) { this.heroImage = heroImage; }

    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }

    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }

    public Integer getReadingTime() { return readingTime; }
    public void setReadingTime(Integer readingTime) { this.readingTime = readingTime; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public Set<Tag> getTags() { return tags; }
    public void setTags(Set<Tag> tags) { this.tags = tags; }

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
    public static BlogBuilder builder() {
        return new BlogBuilder();
    }

    public static class BlogBuilder {
        private Long id;
        private String title;
        private String slug;
        private String shortDescription;
        private String content;
        private Category category;
        private String heroImage;
        private Boolean isPublished = false;
        private Integer views = 0;
        private Integer readingTime = 1;
        private User author;
        private Set<Tag> tags = new HashSet<>();
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

        public BlogBuilder id(Long id) { this.id = id; return this; }
        public BlogBuilder title(String title) { this.title = title; return this; }
        public BlogBuilder slug(String slug) { this.slug = slug; return this; }
        public BlogBuilder shortDescription(String shortDescription) { this.shortDescription = shortDescription; return this; }
        public BlogBuilder content(String content) { this.content = content; return this; }
        public BlogBuilder category(Category category) { this.category = category; return this; }
        public BlogBuilder heroImage(String heroImage) { this.heroImage = heroImage; return this; }
        public BlogBuilder isPublished(Boolean isPublished) { this.isPublished = isPublished; return this; }
        public BlogBuilder views(Integer views) { this.views = views; return this; }
        public BlogBuilder readingTime(Integer readingTime) { this.readingTime = readingTime; return this; }
        public BlogBuilder author(User author) { this.author = author; return this; }
        public BlogBuilder tags(Set<Tag> tags) { this.tags = tags != null ? tags : new HashSet<>(); return this; }
        public BlogBuilder publishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; return this; }
        public BlogBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public BlogBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public BlogBuilder seoTitle(String seoTitle) { this.seoTitle = seoTitle; return this; }
        public BlogBuilder seoDescription(String seoDescription) { this.seoDescription = seoDescription; return this; }
        public BlogBuilder metaKeywords(String metaKeywords) { this.metaKeywords = metaKeywords; return this; }
        public BlogBuilder ogImage(String ogImage) { this.ogImage = ogImage; return this; }
        public BlogBuilder canonicalUrl(String canonicalUrl) { this.canonicalUrl = canonicalUrl; return this; }
        public BlogBuilder faqSchema(String faqSchema) { this.faqSchema = faqSchema; return this; }
        public BlogBuilder breadcrumbSchema(String breadcrumbSchema) { this.breadcrumbSchema = breadcrumbSchema; return this; }
        public BlogBuilder articleSchema(String articleSchema) { this.articleSchema = articleSchema; return this; }

        public Blog build() {
            return new Blog(id, title, slug, shortDescription, content, category, heroImage, isPublished, views,
                    readingTime, author, tags, publishedAt, createdAt, updatedAt, seoTitle, seoDescription,
                    metaKeywords, ogImage, canonicalUrl, faqSchema, breadcrumbSchema, articleSchema);
        }
    }
}
