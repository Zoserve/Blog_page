package com.zoserve.blog.repository;

import com.zoserve.blog.entity.Blog;
import com.zoserve.blog.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    
    Optional<Blog> findBySlug(String slug);
    
    Optional<Blog> findBySlugAndIsPublished(String slug, Boolean isPublished);
    
    boolean existsBySlug(String slug);

    // Advanced dynamic filtering query for search, categories, tags, reading time, and publish status
    @Query("SELECT DISTINCT b FROM Blog b LEFT JOIN b.tags t " +
           "WHERE (:isPublished IS NULL OR b.isPublished = :isPublished) " +
           "AND (:categorySlug IS NULL OR b.category.slug = :categorySlug) " +
           "AND (:tagSlug IS NULL OR t.slug = :tagSlug) " +
           "AND (:search IS NULL OR b.title LIKE CONCAT('%', :search, '%') OR b.shortDescription LIKE CONCAT('%', :search, '%') OR b.content LIKE CONCAT('%', :search, '%')) " +
           "AND (:maxReadingTime IS NULL OR b.readingTime <= :maxReadingTime)")
    Page<Blog> filterBlogs(
        @Param("isPublished") Boolean isPublished,
        @Param("categorySlug") String categorySlug,
        @Param("tagSlug") String tagSlug,
        @Param("search") String search,
        @Param("maxReadingTime") Integer maxReadingTime,
        Pageable pageable
    );

    // Trending blogs: ordered by views descending
    List<Blog> findTop5ByIsPublishedTrueOrderByViewsDesc();

    // Latest blogs (limit 6)
    List<Blog> findTop6ByIsPublishedTrueOrderByPublishedAtDesc();

    // Related blogs (limit 3, same category, excluding current blog)
    List<Blog> findTop3ByIsPublishedTrueAndCategoryAndIdNotOrderByPublishedAtDesc(Category category, Long blogId);

    // Next blog (first published blog after current publishedAt date)
    Optional<Blog> findFirstByIsPublishedTrueAndPublishedAtAfterOrderByPublishedAtAsc(LocalDateTime publishedAt);

    // Previous blog (first published blog before current publishedAt date)
    Optional<Blog> findFirstByIsPublishedTrueAndPublishedAtBeforeOrderByPublishedAtDesc(LocalDateTime publishedAt);

    // Counting methods for admin dashboard stats
    long countByIsPublished(boolean isPublished);
    
    @Query("SELECT SUM(b.views) FROM Blog b")
    Long getTotalViews();
}
