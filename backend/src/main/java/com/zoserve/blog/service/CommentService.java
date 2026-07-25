package com.zoserve.blog.service;

import com.zoserve.blog.dto.CommentRequest;
import com.zoserve.blog.entity.Blog;
import com.zoserve.blog.entity.Comment;
import com.zoserve.blog.repository.BlogRepository;
import com.zoserve.blog.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private BlogRepository blogRepository;

    @Transactional
    public Comment addComment(String slug, CommentRequest request) {
        Blog blog = blogRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Blog not found with slug: " + slug));

        Comment comment = Comment.builder()
                .blog(blog)
                .authorName(request.getAuthorName())
                .authorEmail(request.getAuthorEmail())
                .content(request.getContent())
                .status("APPROVED") // Auto-approve for demo/simplicity, can be changed to PENDING
                .build();

        return commentRepository.save(comment);
    }

    public List<Comment> getApprovedCommentsForBlog(String slug) {
        Blog blog = blogRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Blog not found with slug: " + slug));
        return commentRepository.findByBlogAndStatusOrderByCreatedAtDesc(blog, "APPROVED");
    }

    public List<Comment> getAllCommentsForBlogAdmin(Long blogId) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
        return commentRepository.findByBlogOrderByCreatedAtDesc(blog);
    }

    @Transactional
    public void updateCommentStatus(Long commentId, String status) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setStatus(status);
        commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }
}
