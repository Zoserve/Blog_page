package com.zoserve.blog.config;

import com.zoserve.blog.entity.Category;
import com.zoserve.blog.entity.Tag;
import com.zoserve.blog.entity.User;
import com.zoserve.blog.repository.CategoryRepository;
import com.zoserve.blog.repository.TagRepository;
import com.zoserve.blog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedAdminUser();
        seedCategories();
        seedTags();
    }

    private void seedAdminUser() {
        java.util.Optional<User> adminOpt = userRepository.findByEmail("admin@zoserve.com");
        if (adminOpt.isPresent()) {
            User admin = adminOpt.get();
            admin.setPassword(passwordEncoder.encode("GuruKevin@123"));
            userRepository.save(admin);
            System.out.println("Default administrator account password updated to: GuruKevin@123");
        } else {
            User admin = User.builder()
                    .email("admin@zoserve.com")
                    .password(passwordEncoder.encode("GuruKevin@123"))
                    .firstName("Admin")
                    .lastName("ZoServe")
                    .role("ROLE_ADMIN")
                    .build();
            userRepository.save(admin);
            System.out.println("Default administrator account seeded: admin@zoserve.com / GuruKevin@123");
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            List<Category> categories = Arrays.asList(
                Category.builder().name("Software Engineering").slug("software-engineering").description("Software design patterns, best practices, and architecture.").build(),
                Category.builder().name("Cloud Computing").slug("cloud-computing").description("Serverless, Docker, Kubernetes, AWS, GCP, and cloud platforms.").build(),
                Category.builder().name("Artificial Intelligence").slug("artificial-intelligence").description("Machine Learning, Deep Learning, LLMs, and AI apps.").build(),
                Category.builder().name("UI/UX Design").slug("ui-ux-design").description("Product design, research, typography, layouts, and accessibility.").build(),
                Category.builder().name("Web Development").slug("web-development").description("Modern frontend and backend frameworks and runtimes.").build(),
                Category.builder().name("Mobile Apps").slug("mobile-apps").description("iOS and Android development using native or cross-platform code.").build()
            );
            categoryRepository.saveAll(categories);
            System.out.println("Standard categories seeded.");
        }
    }

    private void seedTags() {
        if (tagRepository.count() == 0) {
            List<Tag> tags = Arrays.asList(
                Tag.builder().name("React").slug("react").build(),
                Tag.builder().name("Spring Boot").slug("spring-boot").build(),
                Tag.builder().name("Java").slug("java").build(),
                Tag.builder().name("TypeScript").slug("typescript").build(),
                Tag.builder().name("Tailwind CSS").slug("tailwind-css").build(),
                Tag.builder().name("Next.js").slug("next-js").build(),
                Tag.builder().name("AI & LLMs").slug("ai-and-llms").build(),
                Tag.builder().name("SEO").slug("seo").build(),
                Tag.builder().name("Security").slug("security").build(),
                Tag.builder().name("MySQL").slug("mysql").build(),
                Tag.builder().name("DevOps").slug("devops").build()
            );
            tagRepository.saveAll(tags);
            System.out.println("Standard tags seeded.");
        }
    }
}
