package com.zoserve.blog.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "images")
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Lob
    @Column(name = "data", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] data;

    @Column(nullable = false)
    private Long size;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Image() {}

    public Image(Long id, String name, String contentType, byte[] data, Long size, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.contentType = contentType;
        this.data = data;
        this.size = size;
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

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public byte[] getData() { return data; }
    public void setData(byte[] data) { this.data = data; }

    public Long getSize() { return size; }
    public void setSize(Long size) { this.size = size; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Static Builder
    public static ImageBuilder builder() {
        return new ImageBuilder();
    }

    public static class ImageBuilder {
        private Long id;
        private String name;
        private String contentType;
        private byte[] data;
        private Long size;
        private LocalDateTime createdAt;

        public ImageBuilder id(Long id) { this.id = id; return this; }
        public ImageBuilder name(String name) { this.name = name; return this; }
        public ImageBuilder contentType(String contentType) { this.contentType = contentType; return this; }
        public ImageBuilder data(byte[] data) { this.data = data; return this; }
        public ImageBuilder size(Long size) { this.size = size; return this; }
        public ImageBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Image build() {
            return new Image(id, name, contentType, data, size, createdAt);
        }
    }
}
