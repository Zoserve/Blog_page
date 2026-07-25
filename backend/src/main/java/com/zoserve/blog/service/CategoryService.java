package com.zoserve.blog.service;

import com.zoserve.blog.entity.Category;
import com.zoserve.blog.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    public Optional<Category> getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug);
    }

    @Transactional
    public Category createCategory(String name, String description) {
        String slug = toSlug(name);
        if (categoryRepository.existsBySlug(slug)) {
            throw new RuntimeException("Category slug already exists: " + slug);
        }
        
        Category category = Category.builder()
                .name(name)
                .slug(slug)
                .description(description)
                .build();
        
        return categoryRepository.save(category);
    }

    public String toSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = java.text.Normalizer.normalize(nowhitespace, java.text.Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase().replaceAll("-{2,}", "-");
    }
}
