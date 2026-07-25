package com.zoserve.blog.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zoserve.blog.dto.AuthorDto;
import com.zoserve.blog.dto.BlogRequest;
import com.zoserve.blog.dto.BlogResponse;
import com.zoserve.blog.entity.*;
import com.zoserve.blog.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class BlogService {

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TagService tagService;

    @Autowired
    private ViewRepository viewRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public Page<BlogResponse> getBlogs(Boolean isPublished, String category, String tag, String search, Integer maxReadingTime, int page, int size, String sortBy, String direction) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Blog> blogPage = blogRepository.filterBlogs(isPublished, category, tag, search, maxReadingTime, pageable);
        return blogPage.map(this::mapToResponse);
    }

    public List<BlogResponse> getTrendingBlogs() {
        return blogRepository.findTop5ByIsPublishedTrueOrderByViewsDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BlogResponse> getLatestBlogs() {
        return blogRepository.findTop6ByIsPublishedTrueOrderByPublishedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BlogResponse getBlogBySlug(String slug, String ipAddress, boolean isPublicRead) {
        Blog blog = blogRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Blog not found with slug: " + slug));

        if (isPublicRead && !blog.getIsPublished()) {
            throw new RuntimeException("This blog is not published yet.");
        }

        if (isPublicRead && ipAddress != null) {
            // Track unique views
            boolean alreadyViewed = viewRepository.existsByBlogAndIpAddress(blog, ipAddress);
            if (!alreadyViewed) {
                View view = View.builder()
                        .blog(blog)
                        .ipAddress(ipAddress)
                        .build();
                viewRepository.save(view);
                blog.setViews(blog.getViews() + 1);
                blogRepository.save(blog);
            }
        }

        BlogResponse response = mapToResponse(blog);

        // Fetch Next and Previous articles
        if (isPublicRead && blog.getPublishedAt() != null) {
            blogRepository.findFirstByIsPublishedTrueAndPublishedAtAfterOrderByPublishedAtAsc(blog.getPublishedAt())
                    .ifPresent(next -> response.setCanonicalUrl(next.getSlug())); // Placeholder use, or we can add custom next/prev fields in DTO
        }

        return response;
    }

    // Helper to get raw Next & Previous references
    public Optional<Blog> getNextBlog(LocalDateTime publishedAt) {
        if (publishedAt == null) return Optional.empty();
        return blogRepository.findFirstByIsPublishedTrueAndPublishedAtAfterOrderByPublishedAtAsc(publishedAt);
    }

    public Optional<Blog> getPreviousBlog(LocalDateTime publishedAt) {
        if (publishedAt == null) return Optional.empty();
        return blogRepository.findFirstByIsPublishedTrueAndPublishedAtBeforeOrderByPublishedAtDesc(publishedAt);
    }

    public List<BlogResponse> getRelatedBlogs(Long blogId) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
        return blogRepository.findTop3ByIsPublishedTrueAndCategoryAndIdNotOrderByPublishedAtDesc(blog.getCategory(), blogId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public BlogResponse createBlog(BlogRequest request, User author) {
        String slug = StringUtils.hasText(request.getSlug()) ? toSlug(request.getSlug()) : toSlug(request.getTitle());
        slug = makeSlugUnique(slug);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        Set<Tag> tags = new HashSet<>();
        if (request.getTags() != null) {
            for (String tagName : request.getTags()) {
                tags.add(tagService.findOrCreateTag(tagName));
            }
        }

        int readingTime = calculateReadingTime(request.getContent());

        Blog blog = Blog.builder()
                .title(request.getTitle())
                .slug(slug)
                .shortDescription(request.getShortDescription())
                .content(request.getContent())
                .category(category)
                .tags(tags)
                .heroImage(request.getHeroImage())
                .isPublished(request.getIsPublished())
                .views(0)
                .readingTime(readingTime)
                .author(author)
                .seoTitle(StringUtils.hasText(request.getSeoTitle()) ? request.getSeoTitle() : request.getTitle())
                .seoDescription(StringUtils.hasText(request.getSeoDescription()) ? request.getSeoDescription() : request.getShortDescription())
                .metaKeywords(request.getMetaKeywords())
                .ogImage(StringUtils.hasText(request.getOgImage()) ? request.getOgImage() : request.getHeroImage())
                .canonicalUrl(StringUtils.hasText(request.getCanonicalUrl()) ? request.getCanonicalUrl() : "https://blog.zoserve.com/blog/" + slug)
                .publishedAt(request.getIsPublished() ? LocalDateTime.now() : null)
                .build();

        generateSchemas(blog, request.getFaqSchema());

        Blog saved = blogRepository.save(blog);
        return mapToResponse(saved);
    }

    @Transactional
    public BlogResponse updateBlog(Long id, BlogRequest request) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        Set<Tag> tags = new HashSet<>();
        if (request.getTags() != null) {
            for (String tagName : request.getTags()) {
                tags.add(tagService.findOrCreateTag(tagName));
            }
        }

        // Handle slug updates
        String newSlug = StringUtils.hasText(request.getSlug()) ? toSlug(request.getSlug()) : toSlug(request.getTitle());
        if (!blog.getSlug().equals(newSlug)) {
            newSlug = makeSlugUnique(newSlug);
            blog.setSlug(newSlug);
        }

        // Publish transition
        if (request.getIsPublished() && !blog.getIsPublished()) {
            blog.setPublishedAt(LocalDateTime.now());
        } else if (!request.getIsPublished()) {
            blog.setPublishedAt(null);
        }

        int readingTime = calculateReadingTime(request.getContent());

        blog.setTitle(request.getTitle());
        blog.setShortDescription(request.getShortDescription());
        blog.setContent(request.getContent());
        blog.setCategory(category);
        blog.setTags(tags);
        blog.setHeroImage(request.getHeroImage());
        blog.setIsPublished(request.getIsPublished());
        blog.setReadingTime(readingTime);
        blog.setSeoTitle(StringUtils.hasText(request.getSeoTitle()) ? request.getSeoTitle() : request.getTitle());
        blog.setSeoDescription(StringUtils.hasText(request.getSeoDescription()) ? request.getSeoDescription() : request.getShortDescription());
        blog.setMetaKeywords(request.getMetaKeywords());
        blog.setOgImage(StringUtils.hasText(request.getOgImage()) ? request.getOgImage() : request.getHeroImage());
        blog.setCanonicalUrl(StringUtils.hasText(request.getCanonicalUrl()) ? request.getCanonicalUrl() : "https://blog.zoserve.com/blog/" + blog.getSlug());

        generateSchemas(blog, request.getFaqSchema());

        Blog saved = blogRepository.save(blog);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteBlog(Long id) {
        if (!blogRepository.existsById(id)) {
            throw new RuntimeException("Blog not found with id: " + id);
        }
        blogRepository.deleteById(id);
    }

    @Transactional
    public void duplicateBlog(Long id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
        
        String duplicatedSlug = makeSlugUnique(blog.getSlug() + "-copy");
        Blog duplicate = Blog.builder()
                .title(blog.getTitle() + " (Copy)")
                .slug(duplicatedSlug)
                .shortDescription(blog.getShortDescription())
                .content(blog.getContent())
                .category(blog.getCategory())
                .tags(new HashSet<>(blog.getTags()))
                .heroImage(blog.getHeroImage())
                .isPublished(false) // Copies start as drafts
                .views(0)
                .readingTime(blog.getReadingTime())
                .author(blog.getAuthor())
                .seoTitle(blog.getSeoTitle() + " (Copy)")
                .seoDescription(blog.getSeoDescription())
                .metaKeywords(blog.getMetaKeywords())
                .ogImage(blog.getOgImage())
                .canonicalUrl("https://blog.zoserve.com/blog/" + duplicatedSlug)
                .faqSchema(blog.getFaqSchema())
                .breadcrumbSchema(blog.getBreadcrumbSchema())
                .articleSchema(blog.getArticleSchema())
                .build();

        blogRepository.save(duplicate);
    }

    @Transactional
    public void bulkPublish(List<Long> ids, boolean publish) {
        List<Blog> blogs = blogRepository.findAllById(ids);
        for (Blog blog : blogs) {
            blog.setIsPublished(publish);
            if (publish && blog.getPublishedAt() == null) {
                blog.setPublishedAt(LocalDateTime.now());
            } else if (!publish) {
                blog.setPublishedAt(null);
            }
        }
        blogRepository.saveAll(blogs);
    }

    @Transactional
    public void bulkDelete(List<Long> ids) {
        blogRepository.deleteAllByIdInBatch(ids);
    }

    private String toSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = java.text.Normalizer.normalize(nowhitespace, java.text.Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase().replaceAll("-{2,}", "-");
    }

    private String makeSlugUnique(String baseSlug) {
        String slug = baseSlug;
        int count = 1;
        while (blogRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + count;
            count++;
        }
        return slug;
    }

    private int calculateReadingTime(String content) {
        if (content == null || content.isEmpty()) return 1;
        String cleanText = content.replaceAll("<[^>]*>", ""); // Simple tag strip
        String[] words = cleanText.trim().split("\\s+");
        return Math.max(1, (int) Math.ceil(words.length / 200.0));
    }

    private void generateSchemas(Blog blog, String faqJsonRaw) {
        try {
            // 1. Breadcrumb Schema
            ObjectNode breadcrumb = objectMapper.createObjectNode();
            breadcrumb.put("@context", "https://schema.org");
            breadcrumb.put("@type", "BreadcrumbList");
            ArrayNode listElements = breadcrumb.putArray("itemListElement");

            ObjectNode home = listElements.addObject();
            home.put("@type", "ListItem");
            home.put("position", 1);
            home.put("name", "Home");
            home.put("item", "https://blog.zoserve.com/blog");

            ObjectNode categoryNode = listElements.addObject();
            categoryNode.put("@type", "ListItem");
            categoryNode.put("position", 2);
            categoryNode.put("name", blog.getCategory().getName());
            categoryNode.put("item", "https://blog.zoserve.com/blog?category=" + blog.getCategory().getSlug());

            ObjectNode postNode = listElements.addObject();
            postNode.put("@type", "ListItem");
            postNode.put("position", 3);
            postNode.put("name", blog.getTitle());
            postNode.put("item", "https://blog.zoserve.com/blog/" + blog.getSlug());

            blog.setBreadcrumbSchema(breadcrumb.toString());

            // 2. Article Schema
            ObjectNode article = objectMapper.createObjectNode();
            article.put("@context", "https://schema.org");
            article.put("@type", "BlogPosting");
            article.put("headline", blog.getSeoTitle() != null ? blog.getSeoTitle() : blog.getTitle());
            article.put("description", blog.getSeoDescription() != null ? blog.getSeoDescription() : blog.getShortDescription());
            if (blog.getHeroImage() != null) {
                article.putArray("image").add(blog.getHeroImage());
            }
            article.put("datePublished", blog.getPublishedAt() != null ? blog.getPublishedAt().format(DateTimeFormatter.ISO_DATE_TIME) : LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            article.put("dateModified", blog.getUpdatedAt().format(DateTimeFormatter.ISO_DATE_TIME));

            ObjectNode author = article.putObject("author");
            author.put("@type", "Person");
            author.put("name", blog.getAuthor().getFirstName() + " " + blog.getAuthor().getLastName());

            ObjectNode publisher = article.putObject("publisher");
            publisher.put("@type", "Organization");
            publisher.put("name", "ZoServe");
            publisher.put("logo", "https://zoserve.com/logo.png"); // Placeholder

            blog.setArticleSchema(article.toString());

            // 3. FAQ Schema (if raw faq data is supplied)
            if (StringUtils.hasText(faqJsonRaw)) {
                // faqJsonRaw is expected to be a JSON array of: [{"question": "Q", "answer": "A"}]
                ArrayNode rawFaqs = (ArrayNode) objectMapper.readTree(faqJsonRaw);
                ObjectNode faqPage = objectMapper.createObjectNode();
                faqPage.put("@context", "https://schema.org");
                faqPage.put("@type", "FAQPage");
                ArrayNode mainEntity = faqPage.putArray("mainEntity");

                for (int i = 0; i < rawFaqs.size(); i++) {
                    ObjectNode qna = (ObjectNode) rawFaqs.get(i);
                    ObjectNode faqItem = mainEntity.addObject();
                    faqItem.put("@type", "Question");
                    faqItem.put("name", qna.get("question").asText());

                    ObjectNode answerNode = faqItem.putObject("acceptedAnswer");
                    answerNode.put("@type", "Answer");
                    answerNode.put("text", qna.get("answer").asText());
                }
                blog.setFaqSchema(faqPage.toString());
            } else {
                blog.setFaqSchema(null);
            }

        } catch (Exception e) {
            // Log & ignore schema compile error, do not fail save operation
            System.err.println("Error compiling JSON schemas: " + e.getMessage());
        }
    }

    public BlogResponse mapToResponse(Blog blog) {
        return BlogResponse.builder()
                .id(blog.getId())
                .title(blog.getTitle())
                .slug(blog.getSlug())
                .shortDescription(blog.getShortDescription())
                .content(blog.getContent())
                .category(blog.getCategory())
                .tags(blog.getTags())
                .heroImage(blog.getHeroImage())
                .isPublished(blog.getIsPublished())
                .views(blog.getViews())
                .readingTime(blog.getReadingTime())
                .author(AuthorDto.builder()
                        .id(blog.getAuthor().getId())
                        .email(blog.getAuthor().getEmail())
                        .firstName(blog.getAuthor().getFirstName())
                        .lastName(blog.getAuthor().getLastName())
                        .build())
                .publishedAt(blog.getPublishedAt())
                .createdAt(blog.getCreatedAt())
                .updatedAt(blog.getUpdatedAt())
                .seoTitle(blog.getSeoTitle())
                .seoDescription(blog.getSeoDescription())
                .metaKeywords(blog.getMetaKeywords())
                .ogImage(blog.getOgImage())
                .canonicalUrl(blog.getCanonicalUrl())
                .faqSchema(blog.getFaqSchema())
                .breadcrumbSchema(blog.getBreadcrumbSchema())
                .articleSchema(blog.getArticleSchema())
                .build();
    }
}
