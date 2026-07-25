package com.zoserve.blog.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "newsletter")
public class Newsletter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "subscribed_at", updatable = false)
    private LocalDateTime subscribedAt;

    // Constructors
    public Newsletter() {}

    public Newsletter(Long id, String email, LocalDateTime subscribedAt) {
        this.id = id;
        this.email = email;
        this.subscribedAt = subscribedAt;
    }

    @PrePersist
    protected void onCreate() {
        subscribedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDateTime getSubscribedAt() { return subscribedAt; }
    public void setSubscribedAt(LocalDateTime subscribedAt) { this.subscribedAt = subscribedAt; }

    // Static Builder
    public static NewsletterBuilder builder() {
        return new NewsletterBuilder();
    }

    public static class NewsletterBuilder {
        private Long id;
        private String email;
        private LocalDateTime subscribedAt;

        public NewsletterBuilder id(Long id) { this.id = id; return this; }
        public NewsletterBuilder email(String email) { this.email = email; return this; }
        public NewsletterBuilder subscribedAt(LocalDateTime subscribedAt) { this.subscribedAt = subscribedAt; return this; }

        public Newsletter build() {
            return new Newsletter(id, email, subscribedAt);
        }
    }
}
