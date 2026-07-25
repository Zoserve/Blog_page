package com.zoserve.blog.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class NewsletterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    // Constructors
    public NewsletterRequest() {}

    public NewsletterRequest(String email) {
        this.email = email;
    }

    // Getters and Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
