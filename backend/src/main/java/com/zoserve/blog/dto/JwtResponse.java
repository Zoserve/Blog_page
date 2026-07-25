package com.zoserve.blog.dto;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;

    // Constructors
    public JwtResponse() {}

    public JwtResponse(String token, String type, Long id, String email, String firstName, String lastName, String role) {
        this.token = token;
        this.type = type != null ? type : "Bearer";
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    // Static Builder
    public static JwtResponseBuilder builder() {
        return new JwtResponseBuilder();
    }

    public static class JwtResponseBuilder {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String role;

        public JwtResponseBuilder token(String token) { this.token = token; return this; }
        public JwtResponseBuilder type(String type) { this.type = type; return this; }
        public JwtResponseBuilder id(Long id) { this.id = id; return this; }
        public JwtResponseBuilder email(String email) { this.email = email; return this; }
        public JwtResponseBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public JwtResponseBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public JwtResponseBuilder role(String role) { this.role = role; return this; }

        public JwtResponse build() {
            return new JwtResponse(token, type, id, email, firstName, lastName, role);
        }
    }
}
