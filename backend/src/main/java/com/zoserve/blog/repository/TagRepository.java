package com.zoserve.blog.repository;

import com.zoserve.blog.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findBySlug(String slug);
    boolean existsByName(String name);
    boolean existsBySlug(String slug);
}
