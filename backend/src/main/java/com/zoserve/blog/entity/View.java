package com.zoserve.blog.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "views")
public class View {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;

    @Column(name = "ip_address", nullable = false, length = 100)
    private String ipAddress;

    @Column(name = "viewed_at", updatable = false)
    private LocalDateTime viewedAt;

    // Constructors
    public View() {}

    public View(Long id, Blog blog, String ipAddress, LocalDateTime viewedAt) {
        this.id = id;
        this.blog = blog;
        this.ipAddress = ipAddress;
        this.viewedAt = viewedAt;
    }

    @PrePersist
    protected void onCreate() {
        viewedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Blog getBlog() { return blog; }
    public void setBlog(Blog blog) { this.blog = blog; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getViewedAt() { return viewedAt; }
    public void setViewedAt(LocalDateTime viewedAt) { this.viewedAt = viewedAt; }

    // Static Builder
    public static ViewBuilder builder() {
        return new ViewBuilder();
    }

    public static class ViewBuilder {
        private Long id;
        private Blog blog;
        private String ipAddress;
        private LocalDateTime viewedAt;

        public ViewBuilder id(Long id) { this.id = id; return this; }
        public ViewBuilder blog(Blog blog) { this.blog = blog; return this; }
        public ViewBuilder ipAddress(String ipAddress) { this.ipAddress = ipAddress; return this; }
        public ViewBuilder viewedAt(LocalDateTime viewedAt) { this.viewedAt = viewedAt; return this; }

        public View build() {
            return new View(id, blog, ipAddress, viewedAt);
        }
    }
}
