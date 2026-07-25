package com.zoserve.blog.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(length = 255)
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Category() {}

    public Category(Long id, String name, String slug, String description, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
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

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Static Builder
    public static CategoryBuilder builder() {
        return new CategoryBuilder();
    }

    public static class CategoryBuilder {
        private Long id;
        private String name;
        private String slug;
        private String description;
        private LocalDateTime createdAt;

        public CategoryBuilder id(Long id) { this.id = id; return this; }
        public CategoryBuilder name(String name) { this.name = name; return this; }
        public CategoryBuilder slug(String slug) { this.slug = slug; return this; }
        public CategoryBuilder description(String description) { this.description = description; return this; }
        public CategoryBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Category build() {
            return new Category(id, name, slug, description, createdAt);
        }
    }
}
