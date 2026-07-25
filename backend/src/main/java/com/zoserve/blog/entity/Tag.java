package com.zoserve.blog.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tags")
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String slug;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Tag() {}

    public Tag(Long id, String name, String slug, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Static Builder
    public static TagBuilder builder() {
        return new TagBuilder();
    }

    public static class TagBuilder {
        private Long id;
        private String name;
        private String slug;
        private LocalDateTime createdAt;

        public TagBuilder id(Long id) { this.id = id; return this; }
        public TagBuilder name(String name) { this.name = name; return this; }
        public TagBuilder slug(String slug) { this.slug = slug; return this; }
        public TagBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Tag build() {
            return new Tag(id, name, slug, createdAt);
        }
    }
}
