package com.zoserve.blog.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CommentRequest {
    @NotBlank(message = "Name is required")
    private String authorName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String authorEmail;

    @NotBlank(message = "Comment text is required")
    private String content;

    // Constructors
    public CommentRequest() {}

    public CommentRequest(String authorName, String authorEmail, String content) {
        this.authorName = authorName;
        this.authorEmail = authorEmail;
        this.content = content;
    }

    // Getters and Setters
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorEmail() { return authorEmail; }
    public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
