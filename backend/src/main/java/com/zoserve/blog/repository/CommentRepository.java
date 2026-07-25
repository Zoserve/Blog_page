package com.zoserve.blog.repository;

import com.zoserve.blog.entity.Blog;
import com.zoserve.blog.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByBlogAndStatusOrderByCreatedAtDesc(Blog blog, String status);
    List<Comment> findByBlogOrderByCreatedAtDesc(Blog blog);
}
