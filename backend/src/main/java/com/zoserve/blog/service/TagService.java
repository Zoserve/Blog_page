package com.zoserve.blog.service;

import com.zoserve.blog.entity.Tag;
import com.zoserve.blog.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    @Transactional
    public Tag findOrCreateTag(String name) {
        String slug = toSlug(name);
        Optional<Tag> existing = tagRepository.findBySlug(slug);
        if (existing.isPresent()) {
            return existing.get();
        }

        Tag tag = Tag.builder()
                .name(name.trim())
                .slug(slug)
                .build();
        return tagRepository.save(tag);
    }

    private String toSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = java.text.Normalizer.normalize(nowhitespace, java.text.Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase().replaceAll("-{2,}", "-");
    }
}
