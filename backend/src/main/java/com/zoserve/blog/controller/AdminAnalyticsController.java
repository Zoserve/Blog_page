package com.zoserve.blog.controller;

import com.zoserve.blog.dto.BlogResponse;
import com.zoserve.blog.dto.DashboardStatsResponse;
import com.zoserve.blog.repository.BlogRepository;
import com.zoserve.blog.repository.CategoryRepository;
import com.zoserve.blog.service.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/admin/analytics")
public class AdminAnalyticsController {

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BlogService blogService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        long totalBlogs = blogRepository.count();
        long publishedBlogs = blogRepository.countByIsPublished(true);
        long draftBlogs = blogRepository.countByIsPublished(false);
        long totalCategories = categoryRepository.count();
        
        Long totalViews = blogRepository.getTotalViews();
        long viewsCount = totalViews != null ? totalViews : 0L;

        // Fetch recent 5 blogs of any status
        Pageable recentLimit = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<BlogResponse> recentBlogs = blogRepository.findAll(recentLimit).getContent().stream()
                .map(blogService::mapToResponse)
                .collect(Collectors.toList());

        DashboardStatsResponse stats = DashboardStatsResponse.builder()
                .totalBlogs(totalBlogs)
                .publishedBlogs(publishedBlogs)
                .draftBlogs(draftBlogs)
                .totalCategories(totalCategories)
                .totalViews(viewsCount)
                .recentBlogs(recentBlogs)
                .build();

        return ResponseEntity.ok(stats);
    }
}
