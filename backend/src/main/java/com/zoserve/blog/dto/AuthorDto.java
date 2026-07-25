package com.zoserve.blog.dto;

public class AuthorDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;

    // Constructors
    public AuthorDto() {}

    public AuthorDto(Long id, String email, String firstName, String lastName) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    // Static Builder
    public static AuthorDtoBuilder builder() {
        return new AuthorDtoBuilder();
    }

    public static class AuthorDtoBuilder {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;

        public AuthorDtoBuilder id(Long id) { this.id = id; return this; }
        public AuthorDtoBuilder email(String email) { this.email = email; return this; }
        public AuthorDtoBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public AuthorDtoBuilder lastName(String lastName) { this.lastName = lastName; return this; }

        public AuthorDto build() {
            return new AuthorDto(id, email, firstName, lastName);
        }
    }
}
