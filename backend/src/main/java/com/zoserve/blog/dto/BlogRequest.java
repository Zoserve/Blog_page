package com.zoserve.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

public class BlogRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String slug;

    @NotBlank(message = "Short description is required")
    private String shortDescription;

    @NotBlank(message = "Content body is required")
    private String content;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private Set<String> tags;

    private String heroImage;

    private Boolean isPublished = false;

    // SEO Meta
    private String seoTitle;
    private String seoDescription;
    private String metaKeywords;
    private String ogImage;
    private String canonicalUrl;

    // JSON schemas
    private String faqSchema;

    // Constructors
    public BlogRequest() {}

    public BlogRequest(String title, String slug, String shortDescription, String content, Long categoryId,
                       Set<String> tags, String heroImage, Boolean isPublished, String seoTitle,
                       String seoDescription, String metaKeywords, String ogImage, String canonicalUrl, String faqSchema) {
        this.title = title;
        this.slug = slug;
        this.shortDescription = shortDescription;
        this.content = content;
        this.categoryId = categoryId;
        this.tags = tags;
        this.heroImage = heroImage;
        this.isPublished = isPublished != null ? isPublished : false;
        this.seoTitle = seoTitle;
        this.seoDescription = seoDescription;
        this.metaKeywords = metaKeywords;
        this.ogImage = ogImage;
        this.canonicalUrl = canonicalUrl;
        this.faqSchema = faqSchema;
    }

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public Set<String> getTags() { return tags; }
    public void setTags(Set<String> tags) { this.tags = tags; }

    public String getHeroImage() { return heroImage; }
    public void setHeroImage(String heroImage) { this.heroImage = heroImage; }

    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }

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
}
