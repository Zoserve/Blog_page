-- ZoServe Blog CMS Seed Data (MySQL)

USE zoserve_blog;

-- Seed Default Admin User (Password is 'GuruKevin@123', synchronized/hashed on startup via DatabaseSeeder.java)
INSERT INTO users (email, password, first_name, last_name, role) 
VALUES ('admin@zoserve.com', '$2a$10$8.e9XzR3E.3E93C/D48mB.Fm.KjP7a2bM9g6uYhOq3GjV1c4B9mBq', 'Admin', 'ZoServe', 'ROLE_ADMIN')
ON DUPLICATE KEY UPDATE email=email;

-- Seed Categories
INSERT INTO categories (name, slug, description) VALUES
('Software Engineering', 'software-engineering', 'Best practices, design patterns, and general software architecture.'),
('Cloud Computing', 'cloud-computing', 'Infrastructure, AWS, GCP, Azure, and deployment strategies.'),
('Artificial Intelligence', 'artificial-intelligence', 'Machine Learning, LLMs, Neural Networks, and AI integrations.'),
('UI/UX Design', 'ui-ux-design', 'Creating beautiful, accessible, and high-converting user interfaces.'),
('Web Development', 'web-development', 'Modern web technologies, frontend frameworks, and backend solutions.'),
('Mobile Apps', 'mobile-apps', 'Native and cross-platform mobile application development.')
ON DUPLICATE KEY UPDATE name=name;

-- Seed Tags
INSERT INTO tags (name, slug) VALUES
('React', 'react'),
('Spring Boot', 'spring-boot'),
('Java', 'java'),
('TypeScript', 'typescript'),
('Tailwind CSS', 'tailwind-css'),
('Next.js', 'next-js'),
('AI & LLMs', 'ai-and-llms'),
('SEO', 'seo'),
('Security', 'security'),
('PostgreSQL', 'postgresql'),
('MySQL', 'mysql'),
('DevOps', 'devops')
ON DUPLICATE KEY UPDATE name=name;
