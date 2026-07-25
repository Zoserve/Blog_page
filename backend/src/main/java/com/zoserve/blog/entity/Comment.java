package com.zoserve.blog.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;

    @Column(name = "author_name", nullable = false, length = 100)
    private String authorName;

    @Column(name = "author_email", nullable = false, length = 100)
    private String authorEmail;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, APPROVED, SPAM

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Comment() {}

    public Comment(Long id, Blog blog, String authorName, String authorEmail, String content, String status, LocalDateTime createdAt) {
        this.id = id;
        this.blog = blog;
        this.authorName = authorName;
        this.authorEmail = authorEmail;
        this.content = content;
        this.status = status != null ? status : "PENDING";
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Blog getBlog() { return blog; }
    public void setBlog(Blog blog) { this.blog = blog; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorEmail() { return authorEmail; }
    public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Static Builder
    public static CommentBuilder builder() {
        return new CommentBuilder();
    }

    public static class CommentBuilder {
        private Long id;
        private Blog blog;
        private String authorName;
        private String authorEmail;
        private String content;
        private String status = "PENDING";
        private LocalDateTime createdAt;

        public CommentBuilder id(Long id) { this.id = id; return this; }
        public CommentBuilder blog(Blog blog) { this.blog = blog; return this; }
        public CommentBuilder authorName(String authorName) { this.authorName = authorName; return this; }
        public CommentBuilder authorEmail(String authorEmail) { this.authorEmail = authorEmail; return this; }
        public CommentBuilder content(String content) { this.content = content; return this; }
        public CommentBuilder status(String status) { this.status = status; return this; }
        public CommentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Comment build() {
            return new Comment(id, blog, authorName, authorEmail, content, status, createdAt);
        }
    }
}
