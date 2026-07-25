package com.zoserve.blog.controller;

import com.zoserve.blog.dto.BlogResponse;
import com.zoserve.blog.dto.CommentRequest;
import com.zoserve.blog.dto.NewsletterRequest;
import com.zoserve.blog.entity.Category;
import com.zoserve.blog.entity.Comment;
import com.zoserve.blog.entity.Image;
import com.zoserve.blog.entity.Tag;
import com.zoserve.blog.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/public")
public class PublicController {

    @Autowired
    private BlogService blogService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private TagService tagService;

    @Autowired
    private ImageService imageService;

    @Autowired
    private NewsletterService newsletterService;

    @Autowired
    private CommentService commentService;

    @Autowired
    private SeoFeedService seoFeedService;

    // Paginated and Filtered Blogs
    @GetMapping("/blogs")
    public ResponseEntity<Page<BlogResponse>> getBlogs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer maxReadingTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Page<BlogResponse> blogs = blogService.getBlogs(true, category, tag, search, maxReadingTime, page, size, sortBy, direction);
        return ResponseEntity.ok(blogs);
    }

    // Latest 6 blogs
    @GetMapping("/blogs/latest")
    public ResponseEntity<List<BlogResponse>> getLatestBlogs() {
        return ResponseEntity.ok(blogService.getLatestBlogs());
    }

    // Trending 5 blogs
    @GetMapping("/blogs/trending")
    public ResponseEntity<List<BlogResponse>> getTrendingBlogs() {
        return ResponseEntity.ok(blogService.getTrendingBlogs());
    }

    // Single Blog details
    @GetMapping("/blogs/{slug}")
    public ResponseEntity<BlogResponse> getBlogBySlug(@PathVariable String slug, HttpServletRequest request) {
        // Extract IP address for unique view tracking
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        // If X-Forwarded-For is a comma-separated list, take the first client IP
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }

        BlogResponse blog = blogService.getBlogBySlug(slug, ipAddress, true);
        return ResponseEntity.ok(blog);
    }

    // Related blogs (same category, excluding current)
    @GetMapping("/blogs/{id}/related")
    public ResponseEntity<List<BlogResponse>> getRelatedBlogs(@PathVariable Long id) {
        return ResponseEntity.ok(blogService.getRelatedBlogs(id));
    }

    // Categories List
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    // Tags List
    @GetMapping("/tags")
    public ResponseEntity<List<Tag>> getAllTags() {
        return ResponseEntity.ok(tagService.getAllTags());
    }

    // Serve Uploaded Images from DB binary
    @GetMapping("/images/{id}")
    public ResponseEntity<byte[]> serveImage(@PathVariable Long id) {
        Image image = imageService.getImageById(id)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + id));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + image.getName() + "\"")
                .body(image.getData());
    }

    // Newsletter subscription
    @PostMapping("/newsletter/subscribe")
    public ResponseEntity<?> subscribeNewsletter(@Valid @RequestBody NewsletterRequest request) {
        newsletterService.subscribe(request.getEmail());
        return ResponseEntity.ok().body("Successfully subscribed to the newsletter!");
    }

    // Create a blog comment
    @PostMapping("/blogs/{slug}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable String slug, @Valid @RequestBody CommentRequest request) {
        Comment comment = commentService.addComment(slug, request);
        return ResponseEntity.ok(comment);
    }

    // Retrieve approved comments
    @GetMapping("/blogs/{slug}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable String slug) {
        return ResponseEntity.ok(commentService.getApprovedCommentsForBlog(slug));
    }

    // --- SEO Files Endpoints ---

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getRobotsTxt() {
        return ResponseEntity.ok(seoFeedService.generateRobotsTxt());
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> getSitemap() {
        return ResponseEntity.ok(seoFeedService.generateSitemapXml());
    }

    @GetMapping(value = "/rss.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> getRssFeed() {
        return ResponseEntity.ok(seoFeedService.generateRssFeedXml());
    }
}
