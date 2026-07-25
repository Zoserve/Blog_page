package com.zoserve.blog.repository;

import com.zoserve.blog.entity.Newsletter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NewsletterRepository extends JpaRepository<Newsletter, Long> {
    boolean existsByEmail(String email);
}
