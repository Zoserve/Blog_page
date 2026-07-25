package com.zoserve.blog.dto;

import java.time.LocalDateTime;

public class ImageResponse {
    private Long id;
    private String name;
    private String url;
    private String contentType;
    private Long size;
    private LocalDateTime createdAt;

    // Constructors
    public ImageResponse() {}

    public ImageResponse(Long id, String name, String url, String contentType, Long size, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.url = url;
        this.contentType = contentType;
        this.size = size;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getSize() { return size; }
    public void setSize(Long size) { this.size = size; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Static Builder
    public static ImageResponseBuilder builder() {
        return new ImageResponseBuilder();
    }

    public static class ImageResponseBuilder {
        private Long id;
        private String name;
        private String url;
        private String contentType;
        private Long size;
        private LocalDateTime createdAt;

        public ImageResponseBuilder id(Long id) { this.id = id; return this; }
        public ImageResponseBuilder name(String name) { this.name = name; return this; }
        public ImageResponseBuilder url(String url) { this.url = url; return this; }
        public ImageResponseBuilder contentType(String contentType) { this.contentType = contentType; return this; }
        public ImageResponseBuilder size(Long size) { this.size = size; return this; }
        public ImageResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ImageResponse build() {
            return new ImageResponse(id, name, url, contentType, size, createdAt);
        }
    }
}
