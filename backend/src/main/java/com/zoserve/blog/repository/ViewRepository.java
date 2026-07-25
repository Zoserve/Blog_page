package com.zoserve.blog.repository;

import com.zoserve.blog.entity.Blog;
import com.zoserve.blog.entity.View;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ViewRepository extends JpaRepository<View, Long> {
    boolean existsByBlogAndIpAddress(Blog blog, String ipAddress);
    long countByBlog(Blog blog);
}
