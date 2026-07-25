package com.zoserve.blog.controller;

import com.zoserve.blog.dto.BlogRequest;
import com.zoserve.blog.dto.BlogResponse;
import com.zoserve.blog.dto.MessageResponse;
import com.zoserve.blog.entity.User;
import com.zoserve.blog.repository.UserRepository;
import com.zoserve.blog.security.UserDetailsImpl;
import com.zoserve.blog.service.BlogService;
import com.zoserve.blog.repository.BlogRepository;
import com.zoserve.blog.repository.UserRepository;
import com.zoserve.blog.security.UserDetailsImpl;
import com.zoserve.blog.service.BlogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/admin/blogs")
public class AdminBlogController {

    @Autowired
    private BlogService blogService;

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private UserRepository userRepository;

    // List all blogs (including drafts) for admin dashboard with filtering and pagination
    @GetMapping
    public ResponseEntity<Page<BlogResponse>> getAdminBlogs(
            @RequestParam(required = false) Boolean isPublished,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer maxReadingTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Page<BlogResponse> blogs = blogService.getBlogs(isPublished, category, tag, search, maxReadingTime, page, size, sortBy, direction);
        return ResponseEntity.ok(blogs);
    }

    // Fetch a single blog by ID (including draft) for editing
    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> getBlogById(@PathVariable Long id) {
        BlogResponse blog = blogService.getBlogBySlug(
                blogService.mapToResponse(blogRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Blog not found with id: " + id))).getSlug(),
                null,
                false
        );
        return ResponseEntity.ok(blog);
    }

    // Create a new blog post
    @PostMapping
    public ResponseEntity<BlogResponse> createBlog(@Valid @RequestBody BlogRequest request) {
        // Retrieve current authenticated admin user
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User author = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));

        BlogResponse response = blogService.createBlog(request, author);
        return ResponseEntity.ok(response);
    }

    // Update an existing blog post
    @PutMapping("/{id}")
    public ResponseEntity<BlogResponse> updateBlog(@PathVariable Long id, @Valid @RequestBody BlogRequest request) {
        BlogResponse response = blogService.updateBlog(id, request);
        return ResponseEntity.ok(response);
    }

    // Delete a blog post
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteBlog(@PathVariable Long id) {
        blogService.deleteBlog(id);
        return ResponseEntity.ok(new MessageResponse("Blog post deleted successfully"));
    }

    // Duplicate a blog post
    @PostMapping("/{id}/duplicate")
    public ResponseEntity<MessageResponse> duplicateBlog(@PathVariable Long id) {
        blogService.duplicateBlog(id);
        return ResponseEntity.ok(new MessageResponse("Blog post duplicated successfully"));
    }

    // Bulk Publish / Unpublish
    @PostMapping("/bulk-publish")
    public ResponseEntity<MessageResponse> bulkPublish(
            @RequestBody List<Long> ids,
            @RequestParam boolean publish
    ) {
        blogService.bulkPublish(ids, publish);
        String action = publish ? "published" : "drafted";
        return ResponseEntity.ok(new MessageResponse("Successfully bulk " + action + " " + ids.size() + " blogs"));
    }

    // Bulk Delete
    @PostMapping("/bulk-delete")
    public ResponseEntity<MessageResponse> bulkDelete(@RequestBody List<Long> ids) {
        blogService.bulkDelete(ids);
        return ResponseEntity.ok(new MessageResponse("Successfully bulk deleted " + ids.size() + " blogs"));
    }
}
